import type { SpawnSyncReturns } from 'node:child_process';
import { spawnSync } from 'node:child_process';

import { GitError, GitFailure } from './git.error.ts';

interface Branch {
  readonly baseText: (path: string) => string;
  readonly diff: string;
  readonly untracked: readonly string[];
}

interface BranchInput {
  readonly env: Readonly<Record<string, string>>;
  readonly folder: string;
  readonly timeoutMs: number;
}

const MAINLINE = 'origin/main';

// A branch that rewrites many files has a diff far past the 1 MiB that spawnSync keeps by default, and
// output cut at that size would read as no change at all.
const GIT_OUTPUT_LIMIT_BYTES = 268_435_456;

const TIMED_OUT = 'ETIMEDOUT';

/**
 * Git reads paths from the folder and lists only its subtree, so a unit of a workspace checks its
 * own changes.
 *
 * @throws {@link GitError} when git does not run, fails, or answers past its time.
 */
const branchIn = (input: BranchInput): Branch => {
  const { folder } = input;

  const runGit = (args: readonly string[]): SpawnSyncReturns<string> => {
    const done = spawnSync('git', args, {
      cwd: folder,
      encoding: 'utf8',
      env: input.env,
      maxBuffer: GIT_OUTPUT_LIMIT_BYTES,
      timeout: input.timeoutMs,
    });

    if (done.error !== undefined) {
      throw new GitError({
        cause: done.error,
        code:
          'code' in done.error && done.error.code === TIMED_OUT
            ? GitFailure.TimedOut
            : GitFailure.NotRun,
        details: {
          args,
          folder,
        },
      });
    }

    return done;
  };

  // A base or a diff git could not give would read as no change, and the gate would pass unchecked.
  const git = (args: readonly string[]): string => {
    const done = runGit(args);

    if (done.status !== 0) {
      throw new GitError({
        code: GitFailure.Failed,
        details: {
          args,
          folder,
          stderr: done.stderr.trim(),
        },
      });
    }

    return done.stdout;
  };

  const base = git([
    'merge-base',
    'HEAD',
    MAINLINE,
  ]).trim();

  return {
    // `cat-file blob` reads nothing for a file the main line never had, where `show` would take the
    // name for a path and print the head commit
    baseText: (path) =>
      runGit([
        'cat-file',
        'blob',
        `${base}:./${path}`,
      ]).stdout,
    diff: git([
      'diff',
      '-U0',
      '--no-color',
      '--diff-filter=ACMR',
      '--relative',
      '--merge-base',
      MAINLINE,
    ]),
    untracked: git([
      'ls-files',
      '--others',
      '--exclude-standard',
    ])
      .split('\n')
      .filter((path) => path !== ''),
  };
};

export type { Branch, BranchInput };
export { branchIn };
