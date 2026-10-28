import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { delimiter, dirname, join } from 'node:path';

const release = join(import.meta.dir, '..', '..');

const INSTALL = 'node_modules';
const LINK = '.droneey/constitution';

const nodeBinary = (tool: string): string => join(release, INSTALL, '.bin', tool);

interface FilesInput {
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

const installedIn = (folder: string): string => {
  if (!existsSync(join(folder, INSTALL))) {
    symlinkSync(join(release, INSTALL), join(folder, INSTALL));
  }

  return folder;
};

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

const machineVariables = (names: readonly string[]): ReadonlyMap<string, string> =>
  new Map(
    names.flatMap((name) => {
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
  );

const environmentOf = (variables: ReadonlyMap<string, string>): Record<string, string> =>
  Object.fromEntries(variables);

const toolEnvironment = (
  variables: ReadonlyMap<string, string> = new Map(),
): Record<string, string> =>
  environmentOf(
    new Map([
      ...machineVariables(MACHINE_VARIABLES),
      [
        'NO_COLOR',
        '1',
      ],
      ...variables,
    ]),
  );

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
  machineVariables,
  nodeBinary,
  release,
  searchPathWith,
  toolEnvironment,
  writeFiles,
};
