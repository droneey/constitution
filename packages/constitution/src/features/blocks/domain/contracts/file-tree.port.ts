import type { AbsolutePath } from '#/kernel/value-objects';

import type { TreePath } from '../value-objects';

interface FileTree {
  /** @throws {TreeError} when git cannot list the files */
  readonly list: () => readonly TreePath[];
  /** @throws {TreeError} when the file cannot be read */
  readonly read: (path: TreePath) => string;
}

interface FileTrees {
  readonly installed: (folderPath: AbsolutePath) => FileTree;
  /** @throws {TreeError} when git fails or answers past its time */
  readonly repository: (folderPath: AbsolutePath) => FileTree;
  readonly tracked: (folderPath: AbsolutePath) => FileTree;
}

export type { FileTree, FileTrees };
