import type { Clock, ConfigParser, FrontMatterParser, ProjectFiles } from '../../../contracts';
import type { ProjectConfig, Resolution } from '../../../entities';
import { ConfigReadStatus, ProjectFailure, ReleaseNotice } from '../../../entities';
import { ProjectError } from '../../../errors';
import type { CatalogueSource } from './catalogue.utils';
import { resolveProject } from './resolve-project.utils';

const CONFIG = 'constitution.yaml';
const REPOSITORY = '.git';
const ARCHIVE = '.droneey/constitution';
const MANIFEST = 'package.json';
const BLOCKS = 'blocks';
const ROOT = '/';
const DOT_SLASH = './';
const PACKS = 'packs';
// The block formats this program reads: the newest, and the oldest it still reads.
const NEWEST_FORMAT = 3;
const OLDEST_FORMAT = 3;
// As sed reads a line of the manifest: the last match on the first line that matches.
const FORMAT = /.*"constitutionFormat"\s*:\s*(\d+).*/;
const VERSION = /.*"version"\s*:\s*"([^"]*)".*/;

const joinPath = (input: { folder: string; name: string }): string =>
  input.folder === ROOT ? `${ROOT}${input.name}` : `${input.folder}/${input.name}`;

const parentOf = (folder: string): string => {
  const at = folder.lastIndexOf('/');

  return at <= 0 ? ROOT : folder.slice(0, at);
};

// The nearest folder with a constitution.yaml at or above the start, up to the root of its
// repository; outside any repository, only the start folder's own.
const findProject = (input: { files: ProjectFiles; start: string }): string | undefined => {
  const { files } = input;
  const start = files.realFolder(input.start);

  if (start === undefined) {
    return undefined;
  }

  const hasConfig = (folder: string): boolean =>
    files.isFile(
      joinPath({
        folder,
        name: CONFIG,
      }),
    );
  let found: string | undefined;

  for (let folder = start; ; folder = parentOf(folder)) {
    found = found ?? (hasConfig(folder) ? folder : undefined);

    if (
      files.exists(
        joinPath({
          folder,
          name: REPOSITORY,
        }),
      )
    ) {
      return found;
    }

    if (folder === ROOT) {
      return hasConfig(start) ? start : undefined;
    }
  }
};

const archiveOf = (project: string): string =>
  joinPath({
    folder: project,
    name: ARCHIVE,
  });

type Release =
  | {
      readonly installed: string;
    }
  | {
      readonly format: number;
      readonly notice: ReleaseNotice;
    };

const firstMatchOf = (input: { pattern: RegExp; text: string }): string | undefined =>
  input.text
    .split('\n')
    .map((line) => input.pattern.exec(line)?.[1])
    .find((found) => found !== undefined);

// The release a project pins, as its manifest names it; a release that names no block format is
// older than the first one read from the blocks.
const readRelease = (input: { archive: string; files: ProjectFiles }): Release => {
  const { archive, files } = input;
  const manifest = joinPath({
    folder: archive,
    name: MANIFEST,
  });

  if (!files.isFolder(archive)) {
    return {
      format: 0,
      notice: ReleaseNotice.Missing,
    };
  }

  const text = files.read(manifest);

  if (text === undefined) {
    throw new ProjectError({
      code: ProjectFailure.ManifestUnreadable,
      path: manifest,
    });
  }

  const format = Number(
    firstMatchOf({
      pattern: FORMAT,
      text,
    }) ?? 0,
  );

  if (format > NEWEST_FORMAT) {
    return {
      format,
      notice: ReleaseNotice.Newer,
    };
  }

  if (format < OLDEST_FORMAT) {
    return {
      format,
      notice: ReleaseNotice.Older,
    };
  }

  const installed =
    firstMatchOf({
      pattern: VERSION,
      text,
    }) ?? '';

  if (installed === '') {
    throw new ProjectError({
      code: ProjectFailure.VersionMissing,
      path: manifest,
    });
  }

  return {
    installed,
  };
};

const sourceOf = (input: {
  files: ProjectFiles;
  folder: string;
  source: string;
  where: string;
}): CatalogueSource => {
  const listed = input.files.listFiles(
    joinPath({
      folder: input.folder,
      name: BLOCKS,
    }),
  );

  return {
    ...(listed === undefined
      ? {}
      : {
          files: listed.map((path) => {
            // Stryker disable next-line ConditionalExpression,StringLiteral: the catalogue reads only the .md files, so another file's text is never used; it is left unread to save the time
            const text = path.endsWith('.md')
              ? input.files.read(`${input.folder}/${BLOCKS}/${path}`)
              : undefined;

            return {
              path: `${BLOCKS}/${path}`,
              // Stryker disable next-line ConditionalExpression: the catalogue reads a text left undefined as one left out
              ...(text === undefined
                ? {}
                : {
                    text,
                  }),
            };
          }),
        }),
    source: input.source,
    where: input.where,
  };
};

// The packs a project lists, in the order it lists them.
const packsOf = (config: ProjectConfig): readonly string[] =>
  config.items
    .filter((entry) => entry.app === '' && entry.key === PACKS)
    .map((entry) => entry.text);

type Declaration =
  | {
      readonly line: number;
      readonly status: ConfigReadStatus.Unparsed;
    }
  | {
      readonly config: ProjectConfig;
      readonly resolution: Resolution;
      readonly status: ConfigReadStatus.Parsed;
    };

// What a project's constitution.yaml declares, read against the release it pins and its packs.
const readDeclaration = (input: {
  archive: string;
  clock: Clock;
  configParser: ConfigParser;
  files: ProjectFiles;
  frontMatterParser: FrontMatterParser;
  project: string;
}): Declaration => {
  const { files, project } = input;
  const path = joinPath({
    folder: project,
    name: CONFIG,
  });
  const text = files.read(path);

  if (text === undefined) {
    throw new ProjectError({
      code: ProjectFailure.ConfigUnreadable,
      path,
    });
  }

  const read = input.configParser.parse(text);
  const archive = sourceOf({
    files,
    folder: input.archive,
    source: '',
    where: input.archive,
  });

  if (archive.files === undefined) {
    throw new ProjectError({
      code: ProjectFailure.BlocksUnlisted,
      path: input.archive,
    });
  }

  if (read.status === ConfigReadStatus.Unparsed) {
    return read;
  }

  // a pack whose blocks folder cannot be listed is not installed
  const packs = packsOf(read.config).map((pack) =>
    sourceOf({
      files,
      folder: joinPath({
        folder: project,
        name: pack.startsWith(DOT_SLASH) ? pack.slice(DOT_SLASH.length) : pack,
      }),
      source: pack,
      where: pack,
    }),
  );

  return {
    config: read.config,
    resolution: resolveProject({
      config: read.config,
      parser: input.frontMatterParser,
      sources: [
        archive,
        ...packs,
      ],
      today: input.clock.today(),
    }),
    status: ConfigReadStatus.Parsed,
  };
};

interface OpenedProject {
  readonly archive: string;
  readonly config: ProjectConfig;
  readonly project: string;
  readonly resolution: Resolution;
}

/**
 * The project around the start folder with what it declares resolved, for the commands a person
 * runs in it.
 *
 * @throws {@link ProjectError} when no project is found, its release is not installed, or its
 * constitution.yaml or its blocks cannot be read
 */
const openProject = (input: {
  clock: Clock;
  configParser: ConfigParser;
  files: ProjectFiles;
  frontMatterParser: FrontMatterParser;
  start: string;
}): OpenedProject => {
  const project = findProject(input);

  if (project === undefined) {
    throw new ProjectError({
      code: ProjectFailure.NoProject,
      path: input.start,
    });
  }

  const archive = archiveOf(project);

  if (!input.files.isFolder(archive)) {
    throw new ProjectError({
      code: ProjectFailure.ArchiveMissing,
      path: archive,
    });
  }

  const declaration = readDeclaration({
    ...input,
    archive,
    project,
  });

  if (declaration.status === ConfigReadStatus.Unparsed) {
    throw new ProjectError({
      code: ProjectFailure.ConfigUnparsed,
      line: declaration.line,
      path: joinPath({
        folder: project,
        name: CONFIG,
      }),
    });
  }

  return {
    archive,
    config: declaration.config,
    project,
    resolution: declaration.resolution,
  };
};

export type { Declaration, OpenedProject, Release };
export { archiveOf, findProject, OLDEST_FORMAT, openProject, readDeclaration, readRelease };
