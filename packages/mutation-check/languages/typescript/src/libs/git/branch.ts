import type { SpawnSyncReturns } from 'node:child_process';
import { spawnSync } from 'node:child_process';

import { GitError, GitFailure } from './git.error.ts';

interface Branch {
  // the text each path had where the branch left the main line, empty for a file it never had
  readonly baseTexts: (paths: readonly string[]) => ReadonlyMap<string, string>;
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

const NEWLINE = 0x0a;

// `cat-file --batch` answers a name with `<id> <type> <size>` and the object's bytes, or with the name
// and why it has no object, such as `missing`.
const OBJECT_HEADER = /^[\da-f]+ \S+ (\d+)/;

// The answer is read as bytes, since a size counts bytes and a text may hold several to a character.
const textsOf = (input: {
  answer: Buffer;
  paths: readonly string[];
}): ReadonlyMap<string, string> => {
  let offset = 0;

  return new Map(
    input.paths.map((path) => {
      const end = input.answer.indexOf(NEWLINE, offset);
      const size = input.answer.toString('utf8', offset, end).match(OBJECT_HEADER)?.[1];
      const start = end + 1;

      if (size === undefined) {
        offset = start;

        return [
          path,
          '',
        ] as const;
      }

      const stop = start + Number(size);

      // the object's bytes end in a newline of their own
      offset = stop + 1;

      return [
        path,
        input.answer.toString('utf8', start, stop),
      ] as const;
    }),
  );
};

/**
 * Git reads paths from the folder and lists only its subtree, so a unit of a workspace checks its
 * own changes.
 *
 * @throws {@link GitError} when git does not run, fails, or answers past its time.
 */
const branchIn = (input: BranchInput): Branch => {
  const { folder } = input;

  // Stryker disable next-line StringLiteral: only `cat-file --batch` reads its input, and gets one
  const runGit = (args: readonly string[], stdin = ''): SpawnSyncReturns<Buffer> => {
    const done = spawnSync('git', args, {
      cwd: folder,
      env: input.env,
      input: stdin,
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
  const git = (args: readonly string[], stdin?: string): Buffer => {
    const done = runGit(args, stdin);

    if (done.status !== 0) {
      throw new GitError({
        code: GitFailure.Failed,
        details: {
          args,
          folder,
          stderr: done.stderr.toString().trim(),
        },
      });
    }

    return done.stdout;
  };

  const base = git([
    'merge-base',
    'HEAD',
    MAINLINE,
  ])
    .toString()
    .trim();

  return {
    // One git for all the paths, `./` resolving each from the folder; a file the main line never had
    // answers `missing` and reads as empty.
    baseTexts: (paths) =>
      textsOf({
        answer: git(
          [
            'cat-file',
            '--batch',
          ],
          paths.map((path) => `${base}:./${path}\n`).join(''),
        ),
        paths,
      }),
    diff: git([
      'diff',
      '-U0',
      '--no-color',
      '--diff-filter=ACMR',
      '--relative',
      '--merge-base',
      MAINLINE,
    ]).toString(),
    untracked: git([
      'ls-files',
      '--others',
      '--exclude-standard',
    ])
      .toString()
      .split('\n')
      .filter((path) => path !== ''),
  };
};

export type { Branch, BranchInput };
export { branchIn };
