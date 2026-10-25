import type { FileRead } from '../entities';

/** The files of a project and of the releases it reads, by absolute path. */
interface ProjectFiles {
  /** whether anything is there, a dangling link aside */
  readonly exists: (path: string) => boolean;
  /** a regular file, through any link */
  readonly isFile: (path: string) => boolean;
  /** a folder, through any link */
  readonly isFolder: (path: string) => boolean;
  /**
   * the regular files below a folder, from it, links to files left out; undefined when it is no
   * folder, or when it holds more files than the implementation lists
   */
  readonly listFiles: (folder: string) => readonly string[] | undefined;
  readonly read: (path: string) => FileRead;
  /** the folder's path with every link resolved, or undefined when it is no folder */
  readonly realFolder: (path: string) => string | undefined;
}

export type { ProjectFiles };
