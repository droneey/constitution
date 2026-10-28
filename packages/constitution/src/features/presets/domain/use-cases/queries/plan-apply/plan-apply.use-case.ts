import type { ProjectFiles } from '#/kernel/contracts';
import { AbsolutePath } from '#/kernel/value-objects';

import type {
  ConfigurationFormat,
  DistributionSources,
  PresetFileParser,
  ProjectReader,
} from '../../../contracts';
import type { LockQueryRepository } from '../../../contracts/repositories/queries';
import type { ApplyPlan, PresetsProject } from '../../../entities';
import { ApplyPlanKind, PresetsCode, ProjectRead } from '../../../entities';
import { computeChanges } from '../../shared/compute-changes';
import { FileChangeKind } from '../../shared/compute-files';

interface PlanApplyInput {
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly locks: LockQueryRepository;
  readonly parser: PresetFileParser;
  readonly reader: ProjectReader;
  readonly startFolderPath: AbsolutePath;
}

const noted: ReadonlySet<PresetsCode> = new Set([
  PresetsCode.LockUnparsed,
]);
const unreported: ReadonlySet<PresetsCode> = new Set([
  PresetsCode.ToolWithoutRunner,
]);

const planOf = (
  input: PlanApplyInput & {
    project: PresetsProject;
  },
): ApplyPlan => {
  const { repositoryFolderPath } = input.project;
  const { files, presetsFindings, units } = computeChanges({
    ...input,
    lockOf: input.locks.read,
  });
  const reported = [
    ...presetsFindings,
    ...units.flatMap((unit) => unit.findings),
    ...files.flatMap((file) => file.findings),
  ].filter((finding) => !unreported.has(finding.code));
  const findings = reported.filter((finding) => !noted.has(finding.code));

  if (findings.length > 0) {
    return {
      findings,
      kind: ApplyPlanKind.Held,
    };
  }

  const written = files.flatMap(({ change, filePath }) =>
    change.kind === FileChangeKind.Written
      ? [
          {
            filePath,
            text: change.text,
          },
        ]
      : [],
  );
  const deleted = files.filter((file) => file.change.kind === FileChangeKind.Deleted);
  const locks = units.flatMap((unit) =>
    unit.lock === undefined
      ? []
      : [
          unit.lock,
        ],
  );

  return {
    changes: {
      deletedFilePaths: deleted.map((file) =>
        AbsolutePath.join(repositoryFolderPath, file.filePath),
      ),
      files: written.map((file) => ({
        filePath: AbsolutePath.join(repositoryFolderPath, file.filePath),
        text: file.text,
      })),
      locks: locks.map((lock) => lock.next),
    },
    kind: ApplyPlanKind.Ready,
    notes: reported,
    report: {
      defaultsAddedToExistingFiles: files.flatMap((file) => file.defaultsAddedToExistingFile),
      deletedFilePaths: deleted.map((file) => file.filePath),
      removedByApply: files.flatMap((file) => file.removedByApply),
      writtenUnitPaths: units
        .filter((unit) => unit.files.some((file) => file.change.kind !== FileChangeKind.Kept))
        .map((unit) => unit.unitPath),
      writtenFilePaths: [
        ...written.map((file) => file.filePath),
        ...locks.map((lock) => lock.filePath),
      ],
    },
  };
};

/**
 * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
 * @throws {ReleaseError} when the release's blocks cannot be listed
 */
const planApply = (input: PlanApplyInput): ProjectRead<ApplyPlan> =>
  ProjectRead.map(input.reader.open(input.startFolderPath), (project) =>
    planOf({
      ...input,
      project,
    }),
  );

export type { PlanApplyInput };
export { planApply };
