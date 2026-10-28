import type { AbsolutePath } from '#/kernel/value-objects';

import type { TreePath } from '../value-objects';

/** Each call throws a {@link TreeError} when git cannot list or read the files. */
interface FileTree {
  readonly list: () => readonly TreePath[];
  readonly read: (path: TreePath) => string;
}

interface FileTrees {
  /** the files of an installed Constitution, as mise unpacks it */
  readonly installed: (folderPath: AbsolutePath) => FileTree;
  /** the files of the repository that holds the folder */
  readonly repository: (folderPath: AbsolutePath) => FileTree;
  /** the files git holds in the folder */
  readonly tracked: (folderPath: AbsolutePath) => FileTree;
}

export type { FileTree, FileTrees };
