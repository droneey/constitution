/** Each call throws a {@link TreeError} when git cannot list or read the files. */
interface FileTree {
  readonly list: () => readonly string[];
  readonly read: (path: string) => string;
}

interface FileTrees {
  /** the files of an installed Constitution, as mise unpacks it */
  readonly installed: (folder: string) => FileTree;
  /** the files of the repository that holds the folder */
  readonly repository: (folder: string) => FileTree;
  /** the files git holds in the folder */
  readonly tracked: (folder: string) => FileTree;
}

export type { FileTree, FileTrees };
