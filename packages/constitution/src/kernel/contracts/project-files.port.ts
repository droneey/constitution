import type { FileRead } from '../entities';
import type { AbsolutePath } from '../value-objects';

interface ProjectFiles {
  /** whether anything is there, a dangling link aside */
  readonly exists: (entryPath: AbsolutePath) => boolean;
  /** a regular file, through any link */
  readonly isFile: (filePath: AbsolutePath) => boolean;
  /** a folder, through any link */
  readonly isFolder: (folderPath: AbsolutePath) => boolean;
  /**
   * the regular files below a folder, by their paths from it, links to files left out; undefined when
   * it is no folder, or when it holds more files than the implementation lists
   */
  readonly listFiles: (folderPath: AbsolutePath) => readonly string[] | undefined;
  readonly read: (filePath: AbsolutePath) => FileRead;
  /** the folder's path with every link resolved, or undefined when it is no folder */
  readonly realFolder: (folderPath: AbsolutePath) => AbsolutePath | undefined;
}

export type { ProjectFiles };
