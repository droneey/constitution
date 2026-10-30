import type { SpawnSyncReturns } from 'node:child_process';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import type { AbsolutePath } from '#/kernel/value-objects';
import { UnitRelativePath } from '#/kernel/value-objects';
import { SpawnErrorCode, spawnErrorCodeOf } from '#/libs/processes';

import type { Branch, BranchReader } from '../../application/contracts';
import type { ChangedFile } from '../../domain/entities';
import type { BranchCommand, UnansweredFailure } from '../../domain/errors';
import { BranchError, BranchFailure } from '../../domain/errors';
import { baseTextsIn, catFileRequestOf } from './cat-file.utils.ts';
import type { UnitSection } from './diff-sections.utils.ts';
import { SectionKind, unitSectionsOf } from './diff-sections.utils.ts';
import { lineRangesOf } from './line-ranges.utils.ts';

interface GitBranchReaderInput {
  readonly env: Readonly<Record<string, string>>;
  readonly outputLimitBytes: number;
  readonly scratchFolderPath: AbsolutePath;
  readonly timeoutMs: number;
  readonly unitFolderPath: AbsolutePath;
}

const TOOL_NAME = 'git';
const MAINLINE_NAME = 'origin/main';

// Why: git writes a name with a byte past ASCII raw, not escaped in quotes, so it reads as written.
const RAW_PATHS = [
  '-c',
  'core.quotePath=false',
] as const;

const UTF8 = 'utf8';
const NUL = '\0';

type Git = (
  args: readonly string[],
  options?: {
    env?: Readonly<Record<string, string>>;
    stdin?: string;
  },
) => Buffer;

const failureOf = (error: Error): UnansweredFailure => {
  switch (spawnErrorCodeOf(error)) {
    case SpawnErrorCode.TimedOut:
      return BranchFailure.ToolTimedOut;
    case SpawnErrorCode.OutputPastLimit:
      return BranchFailure.OutputPastLimit;
    default:
      return BranchFailure.ToolNotRun;
  }
};

// Why: a base or a diff git could not give would read as no change, and the gate would pass
// unchecked.
/** @throws {BranchError} when a call of the git it gives cannot run to its end or ends in failure */
const gitIn = (input: GitBranchReaderInput): Git => {
  const commandOf = (args: readonly string[]): BranchCommand => ({
    args,
    folderPath: input.unitFolderPath,
    toolName: TOOL_NAME,
  });

  /** @throws {BranchError} when git cannot run to its end */
  const runGit = (
    args: readonly string[],
    // Stryker disable next-line StringLiteral: only `cat-file --batch` reads its input, and gets one
    stdin = '',
    env = input.env,
  ): SpawnSyncReturns<Buffer> => {
    const done = spawnSync(TOOL_NAME, args, {
      cwd: input.unitFolderPath,
      env,
      input: stdin,
      maxBuffer: input.outputLimitBytes,
      timeout: input.timeoutMs,
    });

    if (done.error !== undefined) {
      throw new BranchError(
        {
          code: failureOf(done.error),
          command: commandOf(args),
        },
        {
          cause: done.error,
        },
      );
    }

    return done;
  };

  return (args, options) => {
    const done = runGit(args, options?.stdin, options?.env);

    if (done.status !== 0) {
      throw new BranchError({
        code: BranchFailure.ToolFailed,
        command: commandOf(args),
        mainlineName: MAINLINE_NAME,
        stderr: done.stderr.toString(UTF8).trim(),
      });
    }

    return done.stdout;
  };
};

// Why: a copy of the index holds the untracked files as ones to add, so git's detection of moves
// pairs each with a file the branch deleted, wherever it lay; the project's own index is never
// written.
const withNewFilesIndexed = <TResult>(input: {
  env: Readonly<Record<string, string>>;
  git: Git;
  read: (env: Readonly<Record<string, string>>) => TResult;
  scratchFolderPath: AbsolutePath;
  untrackedPaths: readonly UnitRelativePath[];
}): TResult => {
  // Stryker disable next-line StringLiteral: the scratch folder's name is never read
  const scratchFolderPath = mkdtempSync(join(input.scratchFolderPath, 'mutation-check-index-'));

  try {
    const indexPath = join(scratchFolderPath, 'index');

    // Why: git checks again the text of a file written in the second the index was, which a newer
    // copy would let it take for unchanged.
    cpSync(
      input
        .git([
          'rev-parse',
          '--path-format=absolute',
          '--git-path',
          'index',
        ])
        .toString(UTF8)
        .trim(),
      indexPath,
      {
        preserveTimestamps: true,
      },
    );

    const env = Object.fromEntries([
      ...Object.entries(input.env),
      [
        'GIT_INDEX_FILE',
        indexPath,
      ],
    ]);

    input.git(
      [
        'add',
        '--intent-to-add',
        '--',
        ...input.untrackedPaths,
      ],
      {
        env,
      },
    );

    return input.read(env);
  } finally {
    rmSync(scratchFolderPath, {
      recursive: true,
    });
  }
};

const isNewUnitFile = (input: {
  section: UnitSection;
  untrackedPaths: readonly UnitRelativePath[];
}): boolean =>
  input.section.kind === SectionKind.Changed &&
  input.untrackedPaths.includes(input.section.filePath);

/** @throws {BranchError} when git cannot run to its end or ends in failure */
const readBranch = (input: GitBranchReaderInput): Branch => {
  const git = gitIn(input);
  const baseCommit = git([
    'merge-base',
    'HEAD',
    MAINLINE_NAME,
  ])
    .toString(UTF8)
    .trim();
  const unitPrefix = git([
    'rev-parse',
    '--show-prefix',
  ])
    .toString(UTF8)
    .trim();
  const untrackedPaths = git([
    'ls-files',
    '-z',
    '--others',
    '--exclude-standard',
  ])
    .toString(UTF8)
    .split(NUL)
    .filter((filePath) => filePath !== '')
    .map(UnitRelativePath.create);
  const sections = withNewFilesIndexed({
    env: input.env,
    git,
    read: (env) =>
      unitSectionsOf({
        diff: git(
          [
            ...RAW_PATHS,
            'diff',
            '-U0',
            '--no-color',
            '--find-renames',
            '--diff-filter=ACMR',
            '--merge-base',
            MAINLINE_NAME,
          ],
          {
            env,
          },
        ).toString(UTF8),
        unitPrefix,
      }),
    scratchFolderPath: input.scratchFolderPath,
    untrackedPaths,
  });
  const movedFromPaths = new Map(
    sections.flatMap((section) =>
      section.kind === SectionKind.Moved
        ? [
            [
              section.filePath,
              section.movedFromPath,
            ] as const,
          ]
        : [],
    ),
  );

  return {
    baseTextsOf: (filePaths) =>
      baseTextsIn({
        answer: git(
          [
            'cat-file',
            '--batch',
          ],
          {
            stdin: catFileRequestOf({
              baseCommit,
              filePaths,
              movedFromPaths,
            }),
          },
        ),
        filePaths,
      }),
    changedFiles: sections
      .filter(
        (section) =>
          !isNewUnitFile({
            section,
            untrackedPaths,
          }),
      )
      .map(
        ({ filePath, text }): ChangedFile => ({
          filePath,
          lineRanges: lineRangesOf(text),
        }),
      ),
    newFilePaths: untrackedPaths.filter((filePath) => !movedFromPaths.has(filePath)),
  };
};

const gitBranchReader = (input: GitBranchReaderInput): BranchReader => ({
  /** @throws {BranchError} when the branch cannot be read */
  read: () => readBranch(input),
});

export { gitBranchReader };
