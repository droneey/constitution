import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { YAML } from 'bun';

import { z } from 'zod';

import { goldenOf } from '#/__tests__/golden.fixtures';

import type { UnitFixture } from './applied-unit.fixtures';
import { miseBinary } from './mise.fixtures';
import { gitIn, toolEnvironment } from './package.fixtures';
import type { Load } from './preset-load.fixtures';
import { loadOf, widestAppliedUnit } from './preset-load.fixtures';

enum Hook {
  PreCommit = 'pre-commit',
  CommitMessage = 'commit-msg',
}

interface HookRun {
  readonly exitCode: number | undefined;
  readonly output: string;
}

interface HookCheck {
  readonly exitCode: number | undefined;
  /** the rules the hook names, each at the head of a line it prints */
  readonly rules: readonly string[];
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
  readonly hook: string;
  readonly job: string;
  readonly run: string;
}

const RULE = /^\[([a-z0-9-]+)\]/gm;

/** lefthook's own validation of the configuration of the widest unit, made a repository. */
const validation = (): Promise<Load> =>
  loadOf('lefthook', {
    command: [
      'sh',
      '-c',
      `git init --quiet && "${miseBinary('lefthook')}" validate`,
    ],
  });

/** The jobs of the lefthook.yaml of the widest unit, beside what is given. */
const unitJobs = (more: Partial<UnitFixture> = {}): readonly UnitJob[] =>
  Object.entries(
    hooks.parse(
      YAML.parse(readFileSync(join(widestAppliedUnit('lefthook', more), 'lefthook.yaml'), 'utf8')),
    ),
  ).flatMap(([hook, parsed]) =>
    parsed.success
      ? parsed.data.jobs.map(({ name, run }) => ({
          hook,
          job: name,
          run,
        }))
      : [],
  );

const shellcheckRc = (): string => join(widestAppliedUnit('lefthook'), '.shellcheckrc');

const shellcheck = miseBinary('shellcheck');

interface JobRunInput {
  readonly hook: Hook;
  readonly job: string;
}

/**
 * The command of a job of the widest unit's lefthook.yaml.
 *
 * @throws Error when the hook holds no such job.
 */
const jobRun = (input: JobRunInput): string => {
  const found = unitJobs().find(({ hook, job }) => hook === input.hook && job === input.job);

  if (found === undefined) {
    throw new Error(`the ${input.hook} hook of lefthook.yaml holds no job ${input.job}`);
  }

  return found.run;
};

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
      env: toolEnvironment(),
      input: run.replaceAll('{staged_files}', '"$@"').replaceAll('{1}', '"$1"'),
    },
  );

  return {
    exitCode: check.status ?? undefined,
    output: check.stdout.trim(),
  };
};

const DETACHED_HEAD = [
  'checkout',
  '--quiet',
  '--detach',
] as const;

// -B, as the branch may be the one git starts a repository on.
const checkoutOf = (branch: string): readonly string[] => [
  'checkout',
  '--quiet',
  '-B',
  branch,
];

// The branch job run in a repository of one commit, its HEAD set by the checkout given.
const headRun = (checkout: readonly string[]): HookRun => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-branch-'));

  try {
    gitIn(folder, [
      'init',
      '--quiet',
    ]);
    gitIn(folder, [
      'commit',
      '--quiet',
      '--allow-empty',
      '--message',
      'chore: Start',
    ]);
    gitIn(folder, checkout);

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
        env: toolEnvironment(),
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

// lefthook passes the message file as {1} and runs each job of the hook under sh; the hook fails as
// its first job to fail does.
const commitMessageRun = (message: string, more: Partial<UnitFixture> = {}): HookRun => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-commit-'));

  try {
    const file = join(folder, 'COMMIT_EDITMSG');

    writeFileSync(file, message);

    const runs = unitJobs(more)
      .filter(({ hook }) => hook === Hook.CommitMessage)
      .map(({ run }) =>
        spawnSync(
          'sh',
          [
            '-c',
            run.replaceAll('{1}', file),
          ],
          {
            encoding: 'utf8',
            env: toolEnvironment(),
          },
        ),
      );
    const failed = runs.find(({ status }) => status !== 0);

    return {
      exitCode: failed === undefined ? 0 : (failed.status ?? undefined),
      output: runs
        .map(({ stdout }) => stdout.trim())
        .filter((output) => output !== '')
        .join('\n'),
    };
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

const checkOf = (run: HookRun): HookCheck => ({
  exitCode: run.exitCode,
  rules: [
    ...run.output.matchAll(RULE),
  ].map(([, rule]) => String(rule)),
});

/** The names of the commit message hook's jobs, in a unit whose override lowers the rules given. */
const commitMessageJobs = (lowered: readonly string[]): readonly string[] =>
  unitJobs({
    lowered,
  })
    .filter(({ hook }) => hook === Hook.CommitMessage)
    .map(({ job }) => job);

/** The branch hook's judgement of the branch checked out. */
const checkBranch = (branch: string): HookCheck => checkOf(headRun(checkoutOf(branch)));

/** The branch hook's judgement of a HEAD on no branch, as in a rebase or a bisect. */
const checkDetachedHead = (): HookCheck => checkOf(headRun(DETACHED_HEAD));

/** The commit message hook's judgement of the message, in the widest unit beside what is given. */
const checkCommitMessage = (message: string, more: Partial<UnitFixture> = {}): HookCheck =>
  checkOf(commitMessageRun(message, more));

interface HookTextsInput {
  readonly branches: readonly string[];
  readonly messages: readonly string[];
}

/** What the hooks print for each message and branch, as a golden file holds it. */
const hookTexts = (input: HookTextsInput): string =>
  goldenOf(
    Object.fromEntries([
      ...input.messages.map((message) => [
        `commit-msg ${JSON.stringify(message)}`,
        commitMessageRun(`${message}\n`).output,
      ]),
      ...input.branches.map((branch) => [
        `pre-commit ${JSON.stringify(branch)}`,
        headRun(checkoutOf(branch)).output,
      ]),
    ]),
  );

export {
  checkBranch,
  checkCommitMessage,
  checkDetachedHead,
  commitMessageJobs,
  Hook,
  hookTexts,
  jobRun,
  shellCheckRun,
  unitJobs,
  validation,
};
