import type { ProjectFiles } from '#/kernel/contracts';
import type { ProjectPlace, Release } from '#/kernel/entities';
import {
  FileRead,
  FileReadStatus,
  NEWEST_FORMAT,
  OLDEST_FORMAT,
  ReleaseStatus,
} from '#/kernel/entities';
import { ProjectError, ProjectFailure } from '#/kernel/errors';
import { Version } from '#/kernel/value-objects';

import { joinPath } from '../shared/project-paths';

const MANIFEST = 'package.json';
// As sed reads a line of the manifest: the last match on the first line that matches.
const FORMAT = /.*"constitutionFormat"\s*:\s*(\d+)/;
const VERSION = /.*"version"\s*:\s*"([^"]*)"/;

const firstMatchOf = (input: { pattern: RegExp; text: string }): string | undefined =>
  input.text
    .split('\n')
    .map((line) => input.pattern.exec(line)?.[1])
    .find((found) => found !== undefined);

/**
 * The release a project pins, as its manifest names it; a release that names no block format is
 * older than the first one read from the blocks.
 *
 * @throws {@link ProjectError} when the manifest cannot be read or names no release version
 */
const readRelease = (input: { files: ProjectFiles; place: ProjectPlace }): Release => {
  const { files } = input;
  const { releaseFolder } = input.place;
  const manifest = joinPath({
    folder: releaseFolder,
    name: MANIFEST,
  });

  if (!files.isFolder(releaseFolder)) {
    return {
      status: ReleaseStatus.Missing,
    };
  }

  const read = files.read(manifest);

  if (read.status !== FileReadStatus.Read) {
    throw new ProjectError(
      {
        code: ProjectFailure.ManifestUnreadable,
        details: {
          path: manifest,
        },
      },
      {
        cause: FileRead.causeOf(read),
      },
    );
  }

  const { text } = read;

  const format = Number(
    firstMatchOf({
      pattern: FORMAT,
      text,
    }) ?? 0,
  );

  if (format > NEWEST_FORMAT) {
    return {
      format,
      status: ReleaseStatus.Newer,
    };
  }

  if (format < OLDEST_FORMAT) {
    return {
      status: ReleaseStatus.Older,
    };
  }

  const version = firstMatchOf({
    pattern: VERSION,
    text,
  });

  if (!Version.is(version)) {
    throw new ProjectError({
      code: ProjectFailure.VersionMissing,
      details: {
        path: manifest,
      },
    });
  }

  return {
    status: ReleaseStatus.Installed,
    version,
  };
};

export { readRelease };
