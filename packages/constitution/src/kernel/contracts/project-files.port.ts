import type { FileRead } from '../entities';
import type { AbsolutePath } from '../value-objects';

interface ProjectFiles {
  readonly exists: (entryPath: AbsolutePath) => boolean;
  readonly isFile: (filePath: AbsolutePath) => boolean;
  readonly isFolder: (folderPath: AbsolutePath) => boolean;
  readonly listFiles: (folderPath: AbsolutePath) => readonly string[] | undefined;
  readonly read: (filePath: AbsolutePath) => FileRead;
  readonly realFolder: (folderPath: AbsolutePath) => AbsolutePath | undefined;
}

export type { ProjectFiles };
