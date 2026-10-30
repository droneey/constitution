import { ConfigReadStatus } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';

import type { ProjectOpening } from '../../../../domain/entities';
import { OpeningStatus } from '../../../../domain/entities';
import { findProject } from '../find-project';
import type { ProjectPorts } from '../read-declaration';
import { readDeclaration } from '../read-declaration';

interface OpenProjectInput extends ProjectPorts {
  readonly startFolderPath: AbsolutePath;
}

/**
 * @throws {ReleaseError} when its blocks cannot be listed
 * @throws {UnreadableFileError} when its constitution.yaml cannot be read
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
