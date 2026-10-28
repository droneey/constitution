import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { appliedUnit } from './applied-unit.fixtures';
import { Hook, jobRun } from './lefthook-preset.fixtures';
import { miseBinary } from './mise.fixtures';
import { gitIn, toolEnvironment, writeFiles } from './package.fixtures';
import type { Load } from './preset-load.fixtures';
import { loadOf } from './preset-load.fixtures';

interface Project {
  readonly files: Readonly<Record<string, string>>;
}

interface Scan {
  readonly exitCode: number | undefined;
  readonly output: string;
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

const SCANNED = 'scanned';

/** betterleaks over a folder of no secret, by the configuration of the widest unit, its warnings shown. */
const configuredScan = (): Promise<Load> =>
  loadOf('betterleaks', {
    command: [
      betterleaks,
      'dir',
      SCANNED,
      '--config',
      '.betterleaks.toml',
      '--no-banner',
      '--log-level',
      'warn',
    ],
    files: {
      [`${SCANNED}/order.ts`]: "export const ORDER_KIND = 'order';\n",
    },
  });

const scanStaged = (project: Project): Scan => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-betterleaks-'));

  try {
    gitIn(folder, [
      'init',
      '--quiet',
    ]);

    copyFileSync(join(secretsUnit(), '.betterleaks.toml'), join(folder, '.betterleaks.toml'));

    writeFiles({
      files: project.files,
      folder,
    });

    gitIn(folder, [
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
        env: toolEnvironment(),
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

export { configuredScan, passwordPackage, scanStaged, token };
