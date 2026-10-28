import type { ProjectFiles } from '#/kernel/contracts';
import type { ProjectUnit } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import type { RepositoryRelativePath } from '#/kernel/value-objects';
import { AbsolutePath, UnitPath, UnitRelativePath } from '#/kernel/value-objects';

import { LOCK_FILE_NAME } from '../../../constants';
import type { ConfigurationFormat } from '../../../contracts';
import type {
  LockRead,
  PresetsFinding,
  PresetsPlan,
  PresetsProject,
  UnitLock,
} from '../../../entities';
import { Lock, LockReadStatus, PresetsCode } from '../../../entities';
import type { FileComputed } from './steps/compute-file';
import { computeFile, FileChangeKind } from './steps/compute-file';

interface UnitComputed {
  readonly files: readonly FileComputed[];
  readonly findings: readonly PresetsFinding[];
  /** absent where the lock stays as it is */
  readonly lock?: {
    readonly filePath: RepositoryRelativePath;
    readonly next: UnitLock;
  };
  readonly unitPath: UnitPath;
}

interface ComputeFilesInput {
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly lockOf: (unitFolderPath: AbsolutePath) => LockRead;
  readonly plan: PresetsPlan;
  readonly project: PresetsProject;
}

const lockFilePath = UnitRelativePath.create(LOCK_FILE_NAME);

const lockOfFiles = (input: { files: readonly FileComputed[]; unit: ProjectUnit }): Lock =>
  Object.fromEntries(
    input.files.flatMap(({ change, filePath }) =>
      change.kind === FileChangeKind.Deleted || Lock.isEmpty(change.record)
        ? []
        : [
            [
              UnitPath.pathFrom(input.unit.path, filePath),
              change.record,
            ],
          ],
    ),
  );

const computeUnit = (
  input: ComputeFilesInput & {
    unit: ProjectUnit;
  },
): UnitComputed => {
  const { unit } = input;
  const { repositoryFolderPath } = input.project;
  const unitFolderPath = AbsolutePath.join(repositoryFolderPath, unit.path);
  const read = input.lockOf(unitFolderPath);
  const lock = read.status === LockReadStatus.Read ? read.lock : {};
  const plans = input.plan.files.filter((plan) => UnitPath.equals(plan.unitPath, unit.path));
  const pathsInUnit = [
    ...new Set([
      ...plans.map((plan) => UnitPath.pathFrom(unit.path, plan.filePath)),
      ...Lock.filePathsOf(lock),
    ]),
  ].toSorted(compareText);
  const files = pathsInUnit.map((pathInUnit) => {
    const filePath = UnitPath.pathOf(unit.path, pathInUnit);

    return computeFile({
      blockIds: input.plan.blockIds.get(pathInUnit) ?? [],
      filePath,
      formats: input.formats,
      plan: plans.find((plan) => plan.filePath === filePath),
      read: input.files.read(AbsolutePath.join(repositoryFolderPath, filePath)),
      record: lock[pathInUnit] ?? Lock.emptyRecord,
    });
  });
  const next = lockOfFiles({
    files,
    unit,
  });
  // A lock that does not parse is written again from the files, even where they call for none.
  const isChanged = read.status === LockReadStatus.Unparsed || !Lock.equals(lock, next);

  return {
    files,
    findings:
      read.status === LockReadStatus.Unparsed
        ? [
            {
              code: PresetsCode.LockUnparsed,
              details: {},
              path: UnitPath.pathOf(unit.path, lockFilePath),
            },
          ]
        : [],
    ...(isChanged
      ? {
          lock: {
            filePath: UnitPath.pathOf(unit.path, lockFilePath),
            next: {
              lock: next,
              unitFolderPath,
            },
          },
        }
      : {}),
    unitPath: unit.path,
  };
};

const computeFiles = (input: ComputeFilesInput): readonly UnitComputed[] =>
  input.project.units.map((unit) =>
    computeUnit({
      ...input,
      unit,
    }),
  );

export type { ComputeFilesInput, UnitComputed };
export { computeFiles };
