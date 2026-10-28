import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { delimiter, dirname, join } from 'node:path';

// This repository's package, the release a unit links as a project links the distribution.
const release = join(import.meta.dir, '..', '..');

const INSTALL = 'node_modules';
// Where a project links the release it follows.
const LINK = '.droneey/constitution';

/** A tool of the package's own development dependencies, as its install links it. */
const nodeBinary = (tool: string): string => join(release, INSTALL, '.bin', tool);

interface FilesInput {
  /** by their paths from the folder */
  readonly files: Readonly<Record<string, string>>;
  readonly folder: string;
}

const writeFiles = (input: FilesInput): void => {
  for (const [path, text] of Object.entries(input.files)) {
    mkdirSync(dirname(join(input.folder, path)), {
      recursive: true,
    });
    writeFileSync(join(input.folder, path), text);
  }
};

/** The folder, its packages resolved from this package's install, as from its own. */
const installedIn = (folder: string): string => {
  if (!existsSync(join(folder, INSTALL))) {
    symlinkSync(join(release, INSTALL), join(folder, INSTALL));
  }

  return folder;
};

/**
 * The folder's link to this release, where a project links the distribution; or to one folder of
 * the release, by its path there, so the link's folder can hold files of its own beside it.
 */
const linkRelease = (folder: string, part = '.'): void => {
  const link = join(folder, LINK, part);

  mkdirSync(dirname(link), {
    recursive: true,
  });
  symlinkSync(join(release, part), link);
};

const MACHINE_VARIABLES = [
  'HOME',
  'PATH',
  'TMPDIR',
] as const;

/**
 * The environment a child process is given, from variables keyed by their names as the tools spell
 * them, which are data rather than names of this code.
 */
const environmentOf = (variables: ReadonlyMap<string, string>): Record<string, string> =>
  Object.fromEntries(variables);

/**
 * What a tool reads from outside its command: of the machine's own settings only where it finds
 * its programs and its folders, so it runs alike on every machine, then the variables given.
 */
const toolEnvironment = (
  variables: ReadonlyMap<string, string> = new Map(),
): Record<string, string> =>
  environmentOf(
    new Map([
      ...MACHINE_VARIABLES.flatMap((name) => {
        const setting = process.env[name];

        return setting === undefined
          ? []
          : [
              [
                name,
                setting,
              ] as const,
            ];
      }),
      [
        'NO_COLOR',
        '1',
      ],
      ...variables,
    ]),
  );

/** The machine's search path for programs with the folders first. */
const searchPathWith = (...folders: readonly string[]): string =>
  [
    ...folders,
    process.env['PATH'] ?? '',
  ].join(delimiter);

const GIT_AUTHOR = [
  '-c',
  'user.name=Fixture',
  '-c',
  'user.email=fixture@example.com',
] as const;

/**
 * git run in the folder by a fixture's author.
 *
 * @throws Error when git fails.
 */
const gitIn = (folder: string, args: readonly string[]): void => {
  const run = spawnSync(
    'git',
    [
      ...GIT_AUTHOR,
      ...args,
    ],
    {
      cwd: folder,
      encoding: 'utf8',
      env: toolEnvironment(),
    },
  );

  if (run.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed in ${folder}: ${run.stderr}`);
  }
};

export {
  environmentOf,
  gitIn,
  installedIn,
  linkRelease,
  nodeBinary,
  release,
  searchPathWith,
  toolEnvironment,
  writeFiles,
};
