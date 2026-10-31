import { CONFIG_FILE_NAME, releaseFolderInProject } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { ProjectPlace } from '#/kernel/entities';
import { AbsolutePath } from '#/kernel/value-objects';

const REPOSITORY_MARKER_NAME = '.git';

const placeOf = (repositoryFolderPath: AbsolutePath): ProjectPlace => ({
  releaseFolderPath: AbsolutePath.join(repositoryFolderPath, releaseFolderInProject),
  repositoryFolderPath,
});

interface FindProjectInput {
  readonly files: ProjectFiles;
  readonly startFolderPath: AbsolutePath;
}

const findProject = (input: FindProjectInput): ProjectPlace | undefined => {
  const { files } = input;
  const startFolderPath = files.realFolder(input.startFolderPath);

  if (startFolderPath === undefined) {
    return undefined;
  }

  const hasConfig = (folderPath: AbsolutePath): boolean =>
    files.isFile(AbsolutePath.join(folderPath, CONFIG_FILE_NAME));

  let found: AbsolutePath | undefined;

  for (let folderPath = startFolderPath; ; folderPath = AbsolutePath.parentOf(folderPath)) {
    found = hasConfig(folderPath) ? folderPath : found;

    if (files.exists(AbsolutePath.join(folderPath, REPOSITORY_MARKER_NAME))) {
      return found === undefined ? undefined : placeOf(found);
    }

    if (folderPath === AbsolutePath.root) {
      return hasConfig(startFolderPath) ? placeOf(startFolderPath) : undefined;
    }
  }
};

export { findProject };
