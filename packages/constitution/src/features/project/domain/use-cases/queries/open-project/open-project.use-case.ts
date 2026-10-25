import type { OpenedProject } from '#/kernel/entities';
import { ConfigReadStatus } from '#/kernel/entities';
import { ProjectError, ProjectFailure } from '#/kernel/errors';

import { findProject } from '../find-project';
import type { ProjectPorts } from '../read-declaration';
import { readDeclaration } from '../read-declaration';
import { CONFIG, joinPath } from '../shared/project-paths';

/**
 * The project around the start folder with what it declares resolved, for the commands a person
 * runs in it.
 *
 * @throws {@link ProjectError} when no project is found, its release is not installed, or its
 * constitution.yaml or its blocks cannot be read
 */
const openProject = (
  input: ProjectPorts & {
    start: string;
  },
): OpenedProject => {
  const place = findProject(input);

  if (place === undefined) {
    throw new ProjectError({
      code: ProjectFailure.NoProject,
      details: {
        path: input.start,
      },
    });
  }

  if (!input.files.isFolder(place.releaseFolder)) {
    throw new ProjectError({
      code: ProjectFailure.ReleaseMissing,
      details: {
        path: place.releaseFolder,
      },
    });
  }

  const declaration = readDeclaration({
    ...input,
    place,
  });

  if (declaration.status === ConfigReadStatus.Unparsed) {
    throw new ProjectError({
      code: ProjectFailure.ConfigUnparsed,
      details: {
        line: declaration.line,
        path: joinPath({
          folder: place.project,
          name: CONFIG,
        }),
      },
    });
  }

  return {
    ...place,
    packs: declaration.packs,
    resolution: declaration.resolution,
  };
};

export { openProject };
