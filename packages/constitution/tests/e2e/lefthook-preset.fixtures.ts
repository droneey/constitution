import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { YAML } from 'bun';

import { z } from 'zod';

import { appliedUnit } from './applied-unit.fixtures';
import { miseBinary } from './mise.fixtures';

enum Hook {
  PreCommit = 'pre-commit',
  CommitMessage = 'commit-msg',
}

interface HookRun {
  exitCode: number | undefined;
  output: string;
}

const hooks = z.record(
  z.string(),
  z.unknown().transform((hook) =>
    z
      .object({
        jobs: z.array(
          z.object({
            name: z.string(),
            run: z.string(),
          }),
        ),
      })
      .safeParse(hook),
  ),
);

interface UnitJob {
  hook: string;
  job: string;
  run: string;
}

// A unit of every block whose preset file gives lefthook a job.
const hooksUnit = (): string =>
  appliedUnit({
    domains: [
      'version-control',
    ],
    implementations: [
      'lefthook',
      'biome',
      'betterleaks',
      'rumdl',
      'ruff',
      'shellcheck',
      'shfmt',
      'editorconfig',
      'tombi',
    ],
    languages: [
      'json',
      'markdown',
      'python',
      'shell',
      'toml',
      'typescript',
      'yaml',
    ],
  });

const unitJobs = (): readonly UnitJob[] =>
  Object.entries(
    hooks.parse(YAML.parse(readFileSync(join(hooksUnit(), 'lefthook.yaml'), 'utf8'))),
  ).flatMap(([hook, parsed]) =>
    parsed.success
      ? parsed.data.jobs.map(({ name, run }) => ({
          hook,
          job: name,
          run,
        }))
      : [],
  );

const shellcheckRc = (): string => join(hooksUnit(), '.shellcheckrc');

const shellcheck = miseBinary('shellcheck');

interface JobRunInput {
  readonly hook: Hook;
  readonly job: string;
}

const jobRun = (input: JobRunInput): string =>
  unitJobs().find(({ hook, job }) => hook === input.hook && job === input.job)?.run ?? 'exit 99';

// lefthook runs a job under sh with its files in place of {staged_files} and
// the message file in place of {1}; ShellCheck reads the command as such a script.
const shellCheckRun = (run: string): HookRun => {
  const check = spawnSync(
    shellcheck,
    [
      '--rcfile',
      shellcheckRc(),
      '--shell=sh',
      '--format=gcc',
      '-',
    ],
    {
      encoding: 'utf8',
      input: run.replaceAll('{staged_files}', '"$@"').replaceAll('{1}', '"$1"'),
    },
  );

  return {
    exitCode: check.status ?? undefined,
    output: check.stdout.trim(),
  };
};

const git = (folder: string, args: readonly string[]): void => {
  spawnSync(
    'git',
    [
      '-c',
      'user.name=Spec',
      '-c',
      'user.email=spec@example.com',
      ...args,
    ],
    {
      cwd: folder,
      encoding: 'utf8',
    },
  );
};

// The branch is checked out in a repository of one commit; undefined detaches HEAD.
const checkBranch = (branch: string | undefined): HookRun => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-branch-'));

  try {
    git(folder, [
      'init',
      '--quiet',
    ]);
    git(folder, [
      'commit',
      '--quiet',
      '--allow-empty',
      '--message',
      'chore: Start',
    ]);
    git(
      folder,
      branch === undefined
        ? [
            'checkout',
            '--quiet',
            '--detach',
          ]
        : [
            'checkout',
            '--quiet',
            '-b',
            branch,
          ],
    );

    const hookRun = spawnSync(
      'sh',
      [
        '-c',
        jobRun({
          hook: Hook.PreCommit,
          job: 'validate-branch',
        }),
      ],
      {
        cwd: folder,
        encoding: 'utf8',
      },
    );

    return {
      exitCode: hookRun.status ?? undefined,
      output: hookRun.stdout.trim(),
    };
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

// lefthook passes the message file as {1} and runs the job under sh.
const checkCommitMessage = (message: string): HookRun => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-commit-'));

  try {
    const file = join(folder, 'COMMIT_EDITMSG');

    writeFileSync(file, message);

    const hookRun = spawnSync(
      'sh',
      [
        '-c',
        jobRun({
          hook: Hook.CommitMessage,
          job: 'commit-message',
        }).replaceAll('{1}', file),
      ],
      {
        encoding: 'utf8',
      },
    );

    return {
      exitCode: hookRun.status ?? undefined,
      output: hookRun.stdout.trim(),
    };
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

export { checkBranch, checkCommitMessage, Hook, jobRun, shellCheckRun, unitJobs };
