import { compareText } from '#/kernel/utils';
import type { AbsolutePath } from '#/kernel/value-objects';
import { UnitPath, UnitRelativePath } from '#/kernel/value-objects';

import { LOCK_FILE_NAME } from '../../constants';
import type { FileComputed, LockRead, PresetsPlan, UnitComputed } from '../../entities';
import { FileChangeKind, Lock, LockReadStatus, PresetsCode } from '../../entities';
import type { FileAsked } from './steps/compute-file';

interface UnitFilesInput {
  readonly plan: PresetsPlan;
  readonly read: LockRead;
  readonly unitPath: UnitPath;
}

interface UnitComputedInput {
  readonly files: readonly FileComputed[];
  readonly read: LockRead;
  readonly unitFolderPath: AbsolutePath;
  readonly unitPath: UnitPath;
}

const lockFilePath = UnitRelativePath.create(LOCK_FILE_NAME);

const lockOfFiles = (input: { files: readonly FileComputed[]; unitPath: UnitPath }): Lock =>
  Object.fromEntries(
    input.files.flatMap(({ change, filePath }) =>
      change.kind === FileChangeKind.Deleted || Lock.isEmpty(change.record)
        ? []
        : [
            [
              UnitPath.pathFrom(input.unitPath, filePath),
              change.record,
            ],
          ],
    ),
  );

const unitFilesOf = (input: UnitFilesInput): readonly FileAsked[] => {
  const { unitPath } = input;
  const lock = Lock.ofRead(input.read);
  const plans = input.plan.files.filter((plan) => UnitPath.equals(plan.unitPath, unitPath));
  const pathsInUnit = [
    ...new Set([
      ...plans.map((plan) => UnitPath.pathFrom(unitPath, plan.filePath)),
      ...Lock.filePathsOf(lock),
    ]),
  ].toSorted(compareText);

  return pathsInUnit.map((pathInUnit) => {
    const filePath = UnitPath.pathOf(unitPath, pathInUnit);

    return {
      blockIds: input.plan.blockIds.get(pathInUnit) ?? [],
      filePath,
      plan: plans.find((plan) => plan.filePath === filePath),
      record: lock[pathInUnit] ?? Lock.emptyRecord,
    };
  });
};

const unitComputedOf = (input: UnitComputedInput): UnitComputed => {
  const { files, read, unitFolderPath, unitPath } = input;
  const lock = Lock.ofRead(read);
  const next = lockOfFiles({
    files,
    unitPath,
  });
  const isChanged = read.status === LockReadStatus.Unparsed || !Lock.equals(lock, next);

  return {
    files,
    findings:
      read.status === LockReadStatus.Unparsed
        ? [
            {
              code: PresetsCode.LockUnparsed,
              details: {},
              path: UnitPath.pathOf(unitPath, lockFilePath),
            },
          ]
        : [],
    ...(isChanged
      ? {
          lock: {
            filePath: UnitPath.pathOf(unitPath, lockFilePath),
            next: {
              lock: next,
              unitFolderPath,
            },
          },
        }
      : {}),
    unitPath,
  };
};

export type { UnitComputedInput, UnitFilesInput };
export { unitComputedOf, unitFilesOf };
