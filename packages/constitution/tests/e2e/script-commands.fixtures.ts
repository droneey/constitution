import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { z } from 'zod';

import { miseBinary } from './mise.fixtures';
import { gitIn, searchPathWith, toolEnvironment } from './package.fixtures';
import { widestAppliedUnit } from './preset-load.fixtures';

interface Analysis {
  readonly codes: readonly number[];
  readonly exitCode: number | undefined;
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
const RC_FILE = '.shellcheckrc';

const manifest = z.object({
  scripts: z.record(z.string(), z.string()),
});

const analyseScript = (text: string): Analysis => {
  const run = spawnSync(
    shellcheck,
    [
      '--rcfile',
      join(widestAppliedUnit('shellcheck'), RC_FILE),
      '--format=json',
      '-',
    ],
    {
      encoding: 'utf8',
      env: toolEnvironment(),
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

const unitScripts = (): Readonly<Record<string, string>> =>
  manifest.parse(JSON.parse(readFileSync(join(widestAppliedUnit('bun'), 'package.json'), 'utf8')))
    .scripts;

const poeTasks = z.object({
  tool: z.object({
    poe: z.object({
      tasks: z.record(z.string(), z.unknown()),
    }),
  }),
});

const shellTask = z.object({
  shell: z.string(),
});

const unitShellTasks = (): Readonly<Record<string, string>> =>
  Object.fromEntries(
    Object.entries(
      poeTasks.parse(
        Bun.TOML.parse(readFileSync(join(widestAppliedUnit('poe'), 'pyproject.toml'), 'utf8')),
      ).tool.poe.tasks,
    ).flatMap(([task, declared]) => {
      const parsed = shellTask.safeParse(declared);

      return parsed.success
        ? [
            [
              task,
              parsed.data.shell,
            ],
          ]
        : [];
    }),
  );

const shellScriptOf = (task: string, run: string): UnitTask => ({
  run: `#!/bin/sh\n${run}\n`,
  task,
});

const unitTasks = (): readonly UnitTask[] => [
  ...Object.entries(unitScripts()).map(([task, run]) => shellScriptOf(task, run)),
  ...Object.entries(unitShellTasks()).map(([task, run]) => shellScriptOf(`poe ${task}`, run)),
];

const exitCodeBesideDeletedFile = (task: string): number | undefined => {
  const script = unitScripts()[task];

  if (script === undefined) {
    throw new Error(`the package.json the presets give a unit holds no script ${task}`);
  }

  const folder = mkdtempSync(join(tmpdir(), 'constitution-deleted-shell-'));
  const shellFile = '#!/bin/sh\nset -eu\n\nprintf \'%s\\n\' "kept"\n';

  try {
    writeFileSync(join(folder, 'kept.sh'), shellFile);
    writeFileSync(join(folder, 'gone.sh'), shellFile);
    gitIn(folder, [
      'init',
      '--quiet',
    ]);
    gitIn(folder, [
      'add',
      '.',
    ]);
    gitIn(folder, [
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
          script,
        ],
        {
          cwd: folder,
          env: toolEnvironment(
            new Map([
              [
                'PATH',
                searchPathWith(dirname(shellcheck), dirname(shfmt)),
              ],
            ]),
          ),
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
