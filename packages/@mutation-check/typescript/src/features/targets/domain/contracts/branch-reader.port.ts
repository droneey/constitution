import type { UnitRelativePath } from '#/kernel/value-objects';

import type { ChangedFile } from '../entities';

/** What the branch changed in the unit since it left the main line. */
interface Branch {
  /**
   * A file the main line never had is left out.
   *
   * @throws BranchError when the texts cannot be read
   */
  readonly baseTextsOf: (
    filePaths: readonly UnitRelativePath[],
  ) => ReadonlyMap<UnitRelativePath, string>;
  /** a file moved into the unit is compared with the file it left */
  readonly changedFiles: readonly ChangedFile[];
  /** save those moved from a file the main line had, which are changed files */
  readonly untrackedPaths: readonly UnitRelativePath[];
}

interface BranchReader {
  /** @throws BranchError when the branch cannot be read */
  readonly read: () => Branch;
}

export type { Branch, BranchReader };
