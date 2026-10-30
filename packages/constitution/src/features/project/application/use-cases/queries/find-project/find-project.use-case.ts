import { CONFIG_FILE_NAME } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import { ProjectPlace } from '#/kernel/entities';
import { AbsolutePath } from '#/kernel/value-objects';

const REPOSITORY_MARKER_NAME = '.git';

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

  return ProjectPlace.find(
    AbsolutePath.upwardFrom(startFolderPath).map((folderPath) => ({
      folderPath,
      holdsConfig: files.isFile(AbsolutePath.join(folderPath, CONFIG_FILE_NAME)),
      holdsRepository: files.exists(AbsolutePath.join(folderPath, REPOSITORY_MARKER_NAME)),
    })),
  );
};

export { findProject };
