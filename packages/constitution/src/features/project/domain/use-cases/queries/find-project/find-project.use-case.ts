import { CONFIG_FILE, RELEASE_FOLDER } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import { ProjectPlace } from '#/kernel/entities';

import { joinPath, ROOT } from '../shared/project-paths';

const REPOSITORY = '.git';

const parentOf = (folder: string): string => {
  const at = folder.lastIndexOf('/');

  return at <= 0 ? ROOT : folder.slice(0, at);
};

const placeOf = (project: string): ProjectPlace =>
  ProjectPlace.create({
    project,
    releaseFolder: joinPath({
      folder: project,
      name: RELEASE_FOLDER,
    }),
  });

interface FindProjectInput {
  readonly files: ProjectFiles;
  readonly start: string;
}

/**
 * The farthest folder with a constitution.yaml at or above the start, up to the root of its
 * repository, whose members each hold one of their own; outside any repository, only the start
 * folder's own. Undefined when there is none.
 */
const findProject = (input: FindProjectInput): ProjectPlace | undefined => {
  const { files } = input;
  const start = files.realFolder(input.start);

  if (start === undefined) {
    return undefined;
  }

  const hasConfig = (folder: string): boolean =>
    files.isFile(
      joinPath({
        folder,
        name: CONFIG_FILE,
      }),
    );

  let found: string | undefined;

  for (let folder = start; ; folder = parentOf(folder)) {
    found = hasConfig(folder) ? folder : found;

    if (
      files.exists(
        joinPath({
          folder,
          name: REPOSITORY,
        }),
      )
    ) {
      return found === undefined ? undefined : placeOf(found);
    }

    if (folder === ROOT) {
      return hasConfig(start) ? placeOf(start) : undefined;
    }
  }
};

export { findProject };
