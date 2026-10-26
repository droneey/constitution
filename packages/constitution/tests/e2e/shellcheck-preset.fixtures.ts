import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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

export { analyseScript, unitTasks };
