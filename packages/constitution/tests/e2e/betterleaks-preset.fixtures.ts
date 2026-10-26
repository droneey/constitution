import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { appliedUnit } from './applied-unit.fixtures';
import { Hook, jobRun } from './lefthook-preset.fixtures';
import { miseBinary } from './mise.fixtures';

interface Project {
  files: Readonly<Record<string, string>>;
}

interface Scan {
  exitCode: number | undefined;
  output: string;
}

const secretsUnit = (): string =>
  appliedUnit({
    domains: [
      'version-control',
    ],
    implementations: [
      'betterleaks',
      'lefthook',
    ],
  });

const betterleaks = miseBinary('betterleaks');

// A token of GitHub's shape, drawn at random on each run: no source file holds
// one, and a random body carries the entropy the scanner looks for.
const TOKEN_BYTES = 48;
const TOKEN_BODY_LENGTH = 36;
const token = `ghp_${randomBytes(TOKEN_BYTES)
  .toString('base64')
  .replaceAll(/[^A-Za-z0-9]/g, '')
  .slice(0, TOKEN_BODY_LENGTH)}`;

// The dependency a lockfile names, joined at run time: written out, this file
// would hold the very line the preset lets through in bun.lock only.
const passwordPackage = [
  '@inquirer',
  'password',
].join('/');

const scanStaged = (project: Project): Scan => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-betterleaks-'));

  try {
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

    copyFileSync(join(secretsUnit(), '.betterleaks.toml'), join(folder, '.betterleaks.toml'));

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
        }).replace(/^betterleaks /, `"${betterleaks}" `),
      ],
      {
        cwd: folder,
        encoding: 'utf8',
      },
    );

    return {
      exitCode: scanning.status ?? undefined,
      output: `${scanning.stdout}${scanning.stderr}`,
    };
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

export { passwordPackage, scanStaged, token };
