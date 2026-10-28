import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { afterAll, describe, expect, it } from 'bun:test';

type Files = Readonly<Record<string, string>>;

interface Outcome {
  readonly status: number | undefined;
  readonly strykerArguments: string | undefined;
}

const mainScriptPath = resolve(import.meta.dirname, '../../src/main.ts');
const repositoryFolderPath = mkdtempSync(join(tmpdir(), 'mutation-check-e2e-'));

afterAll(() => {
  rmSync(repositoryFolderPath, {
    force: true,
    recursive: true,
  });
});

const SPAWN_TIMEOUT_MS = 60_000;

const SOURCE: Files = {
  'src/order.utils.ts': 'export const total = 1;\nexport const count = 2;\n',
} as const;

const CHANGE: Files = {
  'src/line.utils.ts': 'export const line = 1;\n',
  'src/order.utils.ts': 'export const total = 1;\nexport const count = 3;\n',
} as const;

// git sees no configuration of the machine's: its home is the repository's folder, and the system's is off.
const runCommand = (input: { args: readonly string[]; folderPath: string }) =>
  spawnSync(input.args[0] ?? '', input.args.slice(1), {
    cwd: input.folderPath,
    encoding: 'utf8',
    env: Object.fromEntries([
      [
        'GIT_CONFIG_NOSYSTEM',
        '1',
      ],
      [
        'HOME',
        repositoryFolderPath,
      ],
      [
        'PATH',
        `${join(input.folderPath, '.bin')}:${process.env['PATH'] ?? ''}`,
      ],
    ]),
    timeout: SPAWN_TIMEOUT_MS,
  });

const writeFiles = (input: { files: Files; folderPath: string }): void => {
  for (const [filePath, text] of Object.entries(input.files)) {
    mkdirSync(dirname(join(input.folderPath, filePath)), {
      recursive: true,
    });
    writeFileSync(join(input.folderPath, filePath), text);
  }
};

// A repository whose main line holds the unit's source and its configuration, a branch that changes
// it, and a Stryker that keeps the arguments it was given.
const runCheck = (configText: string): Outcome => {
  const folderPath = mkdtempSync(join(repositoryFolderPath, 'unit-'));

  writeFiles({
    files: {
      ...SOURCE,
      'stryker.config.mjs': configText,
    },
    folderPath,
  });

  for (const args of [
    [
      'git',
      'init',
      '--quiet',
    ],
    [
      'git',
      'add',
      '.',
    ],
    [
      'git',
      '-c',
      'user.name=test',
      '-c',
      'user.email=test@example.com',
      'commit',
      '--quiet',
      '--no-verify',
      '-m',
      'base',
    ],
    [
      'git',
      'update-ref',
      'refs/remotes/origin/main',
      'HEAD',
    ],
  ]) {
    runCommand({
      args,
      folderPath,
    });
  }

  writeFiles({
    files: {
      ...CHANGE,
      '.bin/stryker': '#!/bin/sh\nprintf "%s " "$@" > "$PWD/.stryker-arguments"\n',
    },
    folderPath,
  });
  chmodSync(join(folderPath, '.bin/stryker'), 0o755);

  const checked = runCommand({
    args: [
      'bun',
      '--no-env-file',
      mainScriptPath,
    ],
    folderPath,
  });
  const recordedArgumentsPath = join(folderPath, '.stryker-arguments');

  return {
    status: checked.status ?? undefined,
    strykerArguments: existsSync(recordedArgumentsPath)
      ? readFileSync(recordedArgumentsPath, 'utf8').trim()
      : undefined,
  };
};

describe('mutation-check', () => {
  it('should mutate the lines a change touches and the files it adds', () => {
    // Act
    const checked = runCheck("export default { mutate: ['src/**/*.ts'] };\n");

    // Assert
    expect(checked).toStrictEqual({
      status: 0,
      strykerArguments: 'run --mutate src/line.utils.ts,src/order.utils.ts:2-2',
    });
  });
});
