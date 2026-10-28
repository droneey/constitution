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

// The findings that hold no plan, where any other holds it. A lock that does not parse is written
// again from the files, and the plan notes it; a tool no runner runs is the run's and the check's
// to report, so the plan leaves it out.
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
    // none of the findings holds the plan, so each is one it notes
    notes: reported,
    report: {
      added: files.flatMap((file) => file.added),
      deletedFilePaths: deleted.map((file) => file.filePath),
      removed: files.flatMap((file) => file.removed),
      unitPaths: units
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
 * What an apply writes, deletes and reports; a plan with a finding it does not only note is held
 * and writes nothing. A setting the user keeps in a file stays, and one of ours the user changed
 * stays changed.
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
