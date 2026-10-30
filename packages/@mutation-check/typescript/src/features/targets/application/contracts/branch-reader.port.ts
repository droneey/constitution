import type { UnitRelativePath } from '#/kernel/value-objects';

import type { ChangedFile } from '../../domain/changed-file/entities';

interface Branch {
  /** @throws {BranchError} when the texts cannot be read */
  readonly baseTextsOf: (
    filePaths: readonly UnitRelativePath[],
  ) => ReadonlyMap<UnitRelativePath, string>;
  readonly changedFiles: readonly ChangedFile[];
  readonly newFilePaths: readonly UnitRelativePath[];
}

interface BranchReader {
  /** @throws {BranchError} when the branch cannot be read */
  readonly read: () => Branch;
}

export type { Branch, BranchReader };
