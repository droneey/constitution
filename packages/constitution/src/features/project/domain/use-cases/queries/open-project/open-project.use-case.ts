import { ConfigReadStatus } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';

import type { ProjectOpening } from '../../../entities';
import { OpeningStatus } from '../../../entities';
import { findProject } from '../find-project';
import type { ProjectPorts } from '../read-declaration';
import { readDeclaration } from '../read-declaration';

interface OpenProjectInput extends ProjectPorts {
  readonly startFolderPath: AbsolutePath;
}

/**
 * The project around the start folder with what it declares resolved, for the commands a person
 * runs in it; or why it cannot be opened: no project holds the start folder, its release is not
 * installed, or its constitution.yaml does not parse.
 *
 * @throws {@link ReleaseError} when its blocks cannot be listed
 * @throws {@link UnreadableFileError} when its constitution.yaml cannot be read
 */
const openProject = (input: OpenProjectInput): ProjectOpening => {
  const place = findProject(input);

  if (place === undefined) {
    return {
      status: OpeningStatus.NoProject,
    };
  }

  const { releaseFolderPath } = place;

  if (!input.files.isFolder(releaseFolderPath)) {
    return {
      releaseFolderPath,
      status: OpeningStatus.ReleaseMissing,
    };
  }

  const declaration = readDeclaration({
    ...input,
    place,
  });

  if (declaration.status === ConfigReadStatus.Unparsed) {
    return {
      lines: declaration.lines,
      status: OpeningStatus.ConfigUnparsed,
    };
  }

  return {
    project: {
      ...place,
      packs: declaration.packs,
      resolution: declaration.resolution,
    },
    status: OpeningStatus.Opened,
  };
};

export { openProject };
