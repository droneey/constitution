import type { AbsolutePath } from '../value-objects';

interface ProjectPlace {
  readonly releaseFolderPath: AbsolutePath;
  readonly repositoryFolderPath: AbsolutePath;
}

export type { ProjectPlace };
