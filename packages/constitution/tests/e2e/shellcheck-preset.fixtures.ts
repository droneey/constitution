import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { z } from 'zod';

import { miseBinary } from './mise.fixtures';

interface Analysis {
  codes: readonly number[];
  exitCode: number | undefined;
}

interface TemplateTask {
  readonly run: string;
  readonly task: string;
  readonly template: string;
}

const shellcheckReport = z.array(
  z.object({
    code: z.number(),
  }),
);

const repository = join(import.meta.dir, '..', '..');
const shellcheckRc = join(
  repository,
  'presets',
  'shell',
  'shellcheck',
  'foundation',
  'self.shellcheckrc',
);
const shellcheck = miseBinary('shellcheck');
const templates = join(repository, 'templates', 'project');

const miseTasks = z.object({
  tasks: z
    .record(
      z.string(),
      z.object({
        run: z.string(),
      }),
    )
    .optional(),
});

// The project copies the archive's rc to .shellcheckrc; the spec points at it.
const analyseScript = (text: string): Analysis => {
  const run = spawnSync(
    shellcheck,
    [
      '--rcfile',
      shellcheckRc,
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

// The task of every template's mise.toml, whose command mise runs under sh: a project fills each
// placeholder, <parts> and the like, with paths, so a placeholder stands for one word here.
const templateTasks = (): readonly TemplateTask[] =>
  readdirSync(templates, {
    recursive: true,
  })
    .map(String)
    .filter((path) => path.endsWith('/mise.toml'))
    .toSorted((left, right) => left.localeCompare(right))
    .flatMap((path) =>
      Object.entries(
        miseTasks.parse(Bun.TOML.parse(readFileSync(join(templates, path), 'utf8'))).tasks ?? {},
      ).map(([task, { run }]) => ({
        run: `#!/bin/sh\n${run.replaceAll(/<[^<>]+>/g, 'part')}\n`,
        task,
        template: path.slice(0, -'/mise.toml'.length),
      })),
    );

export { analyseScript, templateTasks };
