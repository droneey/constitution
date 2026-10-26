import type { SpawnSyncReturns } from 'node:child_process';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { GitError, GitFailure } from './git.error.ts';

interface Branch {
  // the text each path had where the branch left the main line, under the path it had there, empty for
  // a file it never had
  readonly baseTexts: (paths: readonly string[]) => ReadonlyMap<string, string>;
  // the unit's files the branch changed, a file moved into it diffed against the file it was moved from
  readonly diff: string;
  // the unit's files git does not track, save those moved from a file the main line had
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

// A diff split before each file's header, which each section keeps.
const SECTION = /(?=^diff --git )/m;
// a moved file that keeps its text has no `+++` line, only the name it was moved to; git ends a name
// that holds a space with a tab
const NEW_PATH = /^(?:\+\+\+ b\/|rename to )(.+?)\t?$/m;
const MOVED_FROM = /^rename from (.+)/m;
const NEW_FILE = /^new file mode /m;

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

interface UnitSection {
  // the path from the repository's root of the file the branch moved into the unit, if it did
  readonly from: string | undefined;
  readonly isNew: boolean;
  // from the unit
  readonly path: string;
  readonly text: string;
}

// The sections of a diff of the whole repository whose file lies in the unit, by paths from the unit.
const unitSectionsOf = (input: { diff: string; prefix: string }): readonly UnitSection[] =>
  input.diff
    .split(SECTION)
    .map((text) => ({
      path: text.match(NEW_PATH)?.[1],
      text,
    }))
    .filter(
      (
        section,
      ): section is {
        path: string;
        text: string;
      } => section.path?.startsWith(input.prefix) === true,
    )
    .map(({ path, text }) => {
      const local = path.slice(input.prefix.length);

      return {
        from: text.match(MOVED_FROM)?.[1],
        isNew: NEW_FILE.test(text),
        path: local,
        text: text.replace(`+++ b/${path}`, `+++ b/${local}`),
      };
    });

type Git = (
  args: readonly string[],
  options?: {
    env?: Readonly<Record<string, string>>;
    stdin?: string;
  },
) => Buffer;

// A base or a diff git could not give would read as no change, and the gate would pass unchecked.
const gitIn = (input: BranchInput): Git => {
  const { folder } = input;

  const runGit = (
    args: readonly string[],
    // Stryker disable next-line StringLiteral: only `cat-file --batch` reads its input, and gets one
    stdin = '',
    env = input.env,
  ): SpawnSyncReturns<Buffer> => {
    const done = spawnSync('git', args, {
      cwd: folder,
      env,
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

  return (args, options) => {
    const done = runGit(args, options?.stdin, options?.env);

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
};

const linesOf = (output: Buffer): readonly string[] =>
  output
    .toString()
    .split('\n')
    .filter((line) => line !== '');

/**
 * What git answers with a copy of the index that holds the untracked files as ones to add, so its
 * detection of moves pairs each with a file the branch deleted, wherever in the repository that file
 * lay; the project's own index is never written.
 */
const withNewFilesIndexed = <TResult>(input: {
  env: Readonly<Record<string, string>>;
  git: Git;
  read: (env: Readonly<Record<string, string>>) => TResult;
  untracked: readonly string[];
}): TResult => {
  // Stryker disable next-line StringLiteral: the scratch folder's name is never read
  const scratch = mkdtempSync(join(tmpdir(), 'mutation-check-index-'));

  try {
    const index = join(scratch, 'index');

    // The copy keeps the index's time: git checks again the text of a file written in the second
    // the index was, which a newer copy would let it take for unchanged.
    cpSync(
      input
        .git([
          'rev-parse',
          '--path-format=absolute',
          '--git-path',
          'index',
        ])
        .toString()
        .trim(),
      index,
      {
        preserveTimestamps: true,
      },
    );

    const env = Object.fromEntries([
      ...Object.entries(input.env),
      [
        'GIT_INDEX_FILE',
        index,
      ],
    ]);

    input.git(
      [
        'add',
        '--intent-to-add',
        '--',
        ...input.untracked,
      ],
      {
        env,
      },
    );

    return input.read(env);
  } finally {
    rmSync(scratch, {
      recursive: true,
    });
  }
};

/**
 * Git reads paths from the folder and lists only its subtree, so a unit of a workspace checks its
 * own changes; a file moved into the unit is diffed against the file it left.
 *
 * @throws {@link GitError} when git does not run, fails, or answers past its time.
 */
const branchIn = (input: BranchInput): Branch => {
  const git = gitIn(input);
  const base = git([
    'merge-base',
    'HEAD',
    MAINLINE,
  ])
    .toString()
    .trim();
  const prefix = git([
    'rev-parse',
    '--show-prefix',
  ])
    .toString()
    .trim();
  const untracked = linesOf(
    git([
      'ls-files',
      '--others',
      '--exclude-standard',
    ]),
  );
  const sections = withNewFilesIndexed({
    env: input.env,
    git,
    read: (env) =>
      unitSectionsOf({
        diff: git(
          [
            'diff',
            '-U0',
            '--no-color',
            '--find-renames',
            '--diff-filter=ACMR',
            '--merge-base',
            MAINLINE,
          ],
          {
            env,
          },
        ).toString(),
        prefix,
      }),
    untracked,
  });
  const moves = new Map(
    sections.flatMap(({ from, path }) =>
      from === undefined
        ? []
        : [
            [
              path,
              from,
            ] as const,
          ],
    ),
  );

  return {
    // One git for all the paths: a moved file under the path it had from the root, any other from the
    // folder by `./`; a file the main line never had answers `missing` and reads as empty.
    baseTexts: (paths) =>
      textsOf({
        answer: git(
          [
            'cat-file',
            '--batch',
          ],
          {
            stdin: paths
              .map((path) => {
                const from = moves.get(path);

                return from === undefined ? `${base}:./${path}\n` : `${base}:${from}\n`;
              })
              .join(''),
          },
        ),
        paths,
      }),
    // a file git does not track and nothing was moved into is left to the unit's new files
    diff: sections
      .filter(({ isNew, path }) => !(isNew && untracked.includes(path)))
      .map(({ text }) => text)
      .join(''),
    untracked: untracked.filter((path) => !moves.has(path)),
  };
};

export type { Branch, BranchInput };
export { branchIn };
