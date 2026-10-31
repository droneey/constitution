import { AbsolutePath } from '#/kernel/value-objects';

import type { PresetsFinding } from '../../shared/entities';
import { PresetsCode } from '../../shared/entities';
import type { AppliedFiles } from './applied-files.entity';
import type { ApplyReport } from './apply-report.entity';
import type { FileComputed } from './file-computed.entity';
import { FileChangeKind } from './file-computed.entity';
import type { UnitComputed } from './unit-computed.entity';

enum ApplyPlanKind {
  Ready = 'ready',
  Held = 'held',
}

type ApplyPlan =
  | {
      readonly changes: AppliedFiles;
      readonly kind: ApplyPlanKind.Ready;
      readonly notes: readonly PresetsFinding[];
      readonly report: ApplyReport;
    }
  | {
      readonly findings: readonly PresetsFinding[];
      readonly kind: ApplyPlanKind.Held;
    };

interface ApplyPlanInput {
  readonly files: readonly FileComputed[];
  readonly presetsFindings: readonly PresetsFinding[];
  readonly repositoryFolderPath: AbsolutePath;
  readonly units: readonly UnitComputed[];
}

const noted: ReadonlySet<PresetsCode> = new Set([
  PresetsCode.LockUnparsed,
]);
const unreported: ReadonlySet<PresetsCode> = new Set([
  PresetsCode.ToolWithoutRunner,
]);

const of = (input: ApplyPlanInput): ApplyPlan => {
  const { files, repositoryFolderPath, units } = input;
  const reported = [
    ...input.presetsFindings,
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

const ApplyPlan = {
  of,
} as const;

export { ApplyPlan, ApplyPlanKind };
