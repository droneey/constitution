import type { UnitRelativePath } from '#/kernel/value-objects';

import type { Branch, BranchReader } from '../application/contracts';
import type { ChangedFile } from '../domain/entities';
import type { BranchError } from '../domain/errors';

interface FakeBranch {
  readonly baseTexts?: ReadonlyMap<UnitRelativePath, string>;
  readonly changedFiles?: readonly ChangedFile[];
  readonly newFilePaths?: readonly UnitRelativePath[];
  readonly readFailure?: BranchError;
}

const fakeBranchReader = (fakeBranch: FakeBranch): BranchReader => {
  const branch: Branch = {
    baseTextsOf: (filePaths) =>
      new Map(
        filePaths.flatMap((filePath) => {
          const baseText = fakeBranch.baseTexts?.get(filePath);

          return baseText === undefined
            ? []
            : [
                [
                  filePath,
                  baseText,
                ] as const,
              ];
        }),
      ),
    changedFiles: fakeBranch.changedFiles ?? [],
    newFilePaths: fakeBranch.newFilePaths ?? [],
  };

  return {
    read: () => {
      if (fakeBranch.readFailure !== undefined) {
        throw fakeBranch.readFailure;
      }

      return branch;
    },
  };
};

export { fakeBranchReader };
