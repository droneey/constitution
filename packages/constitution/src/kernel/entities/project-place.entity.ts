import { RELEASE_FOLDER_PATH } from '../constants';
import { AbsolutePath } from '../value-objects';

interface ProjectPlace {
  readonly releaseFolderPath: AbsolutePath;
  readonly repositoryFolderPath: AbsolutePath;
}

interface ProjectFolder {
  readonly folderPath: AbsolutePath;
  readonly holdsConfig: boolean;
  readonly holdsRepository: boolean;
}

const of = (repositoryFolderPath: AbsolutePath): ProjectPlace => ({
  releaseFolderPath: AbsolutePath.join(repositoryFolderPath, RELEASE_FOLDER_PATH),
  repositoryFolderPath,
});

/** The folders run from the start folder up to the root, each with what it holds. */
const find = (folders: readonly ProjectFolder[]): ProjectPlace | undefined => {
  let found: AbsolutePath | undefined;

  for (const folder of folders) {
    found = folder.holdsConfig ? folder.folderPath : found;

    if (folder.holdsRepository) {
      return found === undefined ? undefined : of(found);
    }
  }

  const [start] = folders;

  return start?.holdsConfig === true ? of(start.folderPath) : undefined;
};

const ProjectPlace = {
  find,
} as const;

export type { ProjectFolder };
export { ProjectPlace };
