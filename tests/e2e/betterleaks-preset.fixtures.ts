import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { Hook, jobRun } from './lefthook-preset.fixtures';
import { miseBinary } from './mise.fixtures';

interface Project {
  files: Readonly<Record<string, string>>;
}

interface Scan {
  exitCode: number | undefined;
  output: string;
}

const REPOSITORY = join(import.meta.dir, '..', '..');
const BETTERLEAKS = miseBinary('betterleaks');

// A token of GitHub's shape, drawn at random on each run: no source file holds
// one, and a random body carries the entropy the scanner looks for.
const TOKEN_BYTES = 48;
const TOKEN_BODY_LENGTH = 36;
const TOKEN = `ghp_${randomBytes(TOKEN_BYTES)
  .toString('base64')
  .replaceAll(/[^A-Za-z0-9]/g, '')
  .slice(0, TOKEN_BODY_LENGTH)}`;

// The dependency a lockfile names, joined at run time: written out, this file
// would hold the very line the preset lets through in bun.lock only.
const PASSWORD_PACKAGE = [
  '@inquirer',
  'password',
].join('/');

const scanStaged = (project: Project): Scan => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-betterleaks-'));
  const git = (args: readonly string[]): void => {
    spawnSync(
      'git',
      [
        ...args,
      ],
      {
        cwd: folder,
      },
    );
  };

  git([
    'init',
    '--quiet',
  ]);
  mkdirSync(join(folder, '.droneey'));
  symlinkSync(REPOSITORY, join(folder, '.droneey', 'constitution'));
  writeFileSync(
    join(folder, '.betterleaks.toml'),
    '[extend]\npath = ".droneey/constitution/presets/common/betterleaks/foundation/core.toml"\n',
  );

  for (const [path, text] of Object.entries(project.files)) {
    writeFileSync(join(folder, path), text);
  }

  git([
    'add',
    '.',
  ]);

  const scanning = spawnSync(
    'sh',
    [
      '-c',
      jobRun({
        hook: Hook.PreCommit,
        job: 'secrets',
        part: 'betterleaks',
      }).replace(/^betterleaks /, `"${BETTERLEAKS}" `),
    ],
    {
      cwd: folder,
      encoding: 'utf8',
    },
  );

  rmSync(folder, {
    force: true,
    recursive: true,
  });

  return {
    exitCode: scanning.status ?? undefined,
    output: `${scanning.stdout}${scanning.stderr}`,
  };
};

export { PASSWORD_PACKAGE, scanStaged, TOKEN };
