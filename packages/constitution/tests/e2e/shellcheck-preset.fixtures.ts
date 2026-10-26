import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { z } from 'zod';

import { appliedUnit } from './applied-unit.fixtures';
import { miseBinary } from './mise.fixtures';

interface Analysis {
  codes: readonly number[];
  exitCode: number | undefined;
}

interface UnitTask {
  readonly run: string;
  readonly task: string;
}

const shellcheckReport = z.array(
  z.object({
    code: z.number(),
  }),
);

const shellcheck = miseBinary('shellcheck');
const shfmt = miseBinary('shfmt');

// A unit run by Bun of every tool whose script runs a shell command, beside ShellCheck's own settings.
const tasksUnit = (): string =>
  appliedUnit({
    implementations: [
      'betterleaks',
      'bun',
      'mise',
      'osv-scanner',
      'rumdl',
      'shellcheck',
      'shfmt',
      'tombi',
      'yamllint',
    ],
    languages: [
      'markdown',
      'shell',
      'toml',
      'typescript',
      'yaml',
    ],
  });

const manifest = z.object({
  scripts: z.record(z.string(), z.string()),
});

const analyseScript = (text: string): Analysis => {
  const run = spawnSync(
    shellcheck,
    [
      '--rcfile',
      join(tasksUnit(), '.shellcheckrc'),
      '--format=json',
      '-',
    ],
    {
      encoding: 'utf8',
      input: text,
    },
  );

  return {
    codes: [
      ...new Set(shellcheckReport.parse(JSON.parse(run.stdout)).map(({ code }) => code)),
    ].toSorted((left, right) => left - right),
    exitCode: run.status ?? undefined,
  };
};

// Each script of the package.json the presets give a unit, whose command runs under sh.
const unitTasks = (): readonly UnitTask[] =>
  Object.entries(
    manifest.parse(JSON.parse(readFileSync(join(tasksUnit(), 'package.json'), 'utf8'))).scripts,
  ).map(([task, run]) => ({
    run: `#!/bin/sh\n${run}\n`,
    task,
  }));

const git = (folder: string, args: readonly string[]): void => {
  spawnSync(
    'git',
    [
      '-c',
      'user.name=Fixture',
      '-c',
      'user.email=fixture@example.com',
      ...args,
    ],
    {
      cwd: folder,
    },
  );
};

/**
 * The exit code of a script the presets give a unit, run in a repository that tracks a shell file
 * deleted since its last commit, beside one still there.
 */
const exitCodeBesideDeletedFile = (task: string): number | undefined => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-deleted-shell-'));
  const script = '#!/bin/sh\nset -eu\n\nprintf \'%s\\n\' "kept"\n';

  try {
    writeFileSync(join(folder, 'kept.sh'), script);
    writeFileSync(join(folder, 'gone.sh'), script);
    git(folder, [
      'init',
      '--quiet',
    ]);
    git(folder, [
      'add',
      '.',
    ]);
    git(folder, [
      'commit',
      '--quiet',
      '--no-verify',
      '-m',
      'base',
    ]);
    rmSync(join(folder, 'gone.sh'));

    return (
      spawnSync(
        'sh',
        [
          '-c',
          manifest.parse(JSON.parse(readFileSync(join(tasksUnit(), 'package.json'), 'utf8')))
            .scripts[task] ?? 'exit 1',
        ],
        {
          cwd: folder,
          env: Object.fromEntries([
            ...Object.entries(process.env),
            [
              'PATH',
              `${dirname(shellcheck)}:${dirname(shfmt)}:${process.env['PATH'] ?? ''}`,
            ],
          ]),
        },
      ).status ?? undefined
    );
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

export { analyseScript, exitCodeBesideDeletedFile, unitTasks };
