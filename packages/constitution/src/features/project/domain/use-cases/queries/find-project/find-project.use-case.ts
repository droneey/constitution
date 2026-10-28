import { CONFIG_FILE_NAME, PATH_SEPARATOR, RELEASE_FOLDER_PATH } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { ProjectPlace } from '#/kernel/entities';
import { AbsolutePath } from '#/kernel/value-objects';

const REPOSITORY_MARKER_NAME = '.git';
const rootFolderPath = AbsolutePath.create(PATH_SEPARATOR);

const parentOf = (folderPath: AbsolutePath): AbsolutePath => {
  const at = folderPath.lastIndexOf(PATH_SEPARATOR);

  return at <= 0 ? rootFolderPath : AbsolutePath.create(folderPath.slice(0, at));
};

const placeOf = (repositoryFolderPath: AbsolutePath): ProjectPlace => ({
  releaseFolderPath: AbsolutePath.join(repositoryFolderPath, RELEASE_FOLDER_PATH),
  repositoryFolderPath,
});

interface FindProjectInput {
  readonly files: ProjectFiles;
  readonly startFolderPath: AbsolutePath;
}

/**
 * The farthest folder with a constitution.yaml at or above the start, up to the root of its
 * repository, whose members each hold one of their own; outside any repository, only the start
 * folder's own. Undefined when there is none.
 */
const findProject = (input: FindProjectInput): ProjectPlace | undefined => {
  const { files } = input;
  const startFolderPath = files.realFolder(input.startFolderPath);

  if (startFolderPath === undefined) {
    return undefined;
  }

  const hasConfig = (folderPath: AbsolutePath): boolean =>
    files.isFile(AbsolutePath.join(folderPath, CONFIG_FILE_NAME));

  let found: AbsolutePath | undefined;

  for (let folderPath = startFolderPath; ; folderPath = parentOf(folderPath)) {
    found = hasConfig(folderPath) ? folderPath : found;

    if (files.exists(AbsolutePath.join(folderPath, REPOSITORY_MARKER_NAME))) {
      return found === undefined ? undefined : placeOf(found);
    }

    if (folderPath === rootFolderPath) {
      return hasConfig(startFolderPath) ? placeOf(startFolderPath) : undefined;
    }
  }
};

export { findProject };
