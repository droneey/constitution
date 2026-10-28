import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';

import { BLOCKS_FOLDER_NAME, PATH_SEPARATOR } from '#/kernel/constants';
import { compareText, recognisedFailure } from '#/kernel/utils';
import { AbsolutePath } from '#/kernel/value-objects';
import type { ChildProcessSettings } from '#/libs/child-process';
import { isSystemError } from '#/libs/system-error';

import type { FileTree, FileTrees } from '../../domain/contracts';
import { TreeError, TreeFailure } from '../../domain/errors';
import { TreePath } from '../../domain/value-objects';

const BYTE_ORDER_MARK = '﻿';
// Why: a tree of many files lists past the 1 MiB that spawnSync keeps by default.
const OUTPUT_LIMIT_BYTES = 268_435_456;
const TIMED_OUT = 'ETIMEDOUT';
const GIT_FILES = [
  'ls-files',
  '-z',
  '--cached',
  '--others',
  '--exclude-standard',
] as const;

const isFile = (path: string): boolean =>
  statSync(path, {
    throwIfNoEntry: false,
  })?.isFile() === true;

const normalized = (text: string): string =>
  (text.startsWith(BYTE_ORDER_MARK) ? text.slice(BYTE_ORDER_MARK.length) : text).replaceAll(
    '\r\n',
    '\n',
  );

/** @throws {TreeError} when the file cannot be read */
const readOrFail = <TRead>(path: AbsolutePath, read: (path: AbsolutePath) => TRead): TRead => {
  try {
    return read(path);
  } catch (error) {
    recognisedFailure({
      error,
      isRecognised: isSystemError,
    });

    throw new TreeError(
      {
        code: TreeFailure.Unreadable,
        details: {
          path,
        },
      },
      {
        cause: error,
      },
    );
  }
};

/** @throws {TreeError} when the file cannot be read */
const readListed = (path: AbsolutePath): string =>
  normalized(readOrFail(path, (file) => readFileSync(file, 'utf8')));

/** @throws {TreeError} when git fails or answers past its time */
const runGit = (
  input: ChildProcessSettings & {
    args: readonly string[];
    folder: AbsolutePath;
  },
): string => {
  const run = spawnSync('git', input.args, {
    cwd: input.folder,
    encoding: 'utf8',
    env: input.env,
    maxBuffer: OUTPUT_LIMIT_BYTES,
    timeout: input.timeoutMs,
  });

  if (run.status !== 0) {
    throw new TreeError(
      {
        code:
          run.error !== undefined && 'code' in run.error && run.error.code === TIMED_OUT
            ? TreeFailure.TimedOut
            : TreeFailure.Failed,
        details: {
          path: input.folder,
        },
      },
      {
        cause: run.error,
      },
    );
  }

  return run.stdout;
};

// Why: the tree reads what git holds: an ignored file is no part of the Constitution, and CI sees
// only committed files.
const createGitTree = (
  input: ChildProcessSettings & {
    root: AbsolutePath;
  },
): FileTree => ({
  /** @throws {TreeError} when git fails or answers past its time */
  list: (): readonly TreePath[] =>
    [
      ...new Set(
        runGit({
          ...input,
          args: GIT_FILES,
          folder: input.root,
        }).split('\0'),
      ),
    ]
      .filter((path) => isFile(AbsolutePath.join(input.root, path)))
      .map(TreePath.create)
      .toSorted(compareText),
  /** @throws {TreeError} when the file cannot be read */
  read: (path: TreePath): string => readListed(AbsolutePath.join(input.root, path)),
});

interface FolderTreeInput {
  readonly maxFiles: number;
  readonly root: AbsolutePath;
}

/**
 * @throws {TreeError} when a folder cannot be read, or the folder holds more files than the
 * limit
 */
const pathsBelow = (input: FolderTreeInput): readonly string[] => {
  const paths: string[] = [];
  const folders = [
    BLOCKS_FOLDER_NAME,
  ];

  for (let folder = folders.pop(); folder !== undefined; folder = folders.pop()) {
    for (const entry of readOrFail(AbsolutePath.join(input.root, folder), (listed) =>
      readdirSync(listed, {
        withFileTypes: true,
      }),
    )) {
      const path = `${folder}${PATH_SEPARATOR}${entry.name}`;

      if (entry.isDirectory()) {
        folders.push(path);
      } else {
        paths.push(path);
      }
    }

    if (paths.length > input.maxFiles) {
      throw new TreeError({
        code: TreeFailure.TooLarge,
        details: {
          path: input.root,
        },
      });
    }
  }

  return paths;
};

// Why: mise unpacks the installed Constitution a pack extends with no repository of its own, so its
// blocks are read from their folder.
const createFolderTree = (input: FolderTreeInput): FileTree => ({
  /**
   * @throws {TreeError} when a folder cannot be read, or the folder holds more files than the
   * limit
   */
  list: (): readonly TreePath[] =>
    existsSync(AbsolutePath.join(input.root, BLOCKS_FOLDER_NAME))
      ? pathsBelow(input)
          .filter((path) => isFile(AbsolutePath.join(input.root, path)))
          .map(TreePath.create)
          .toSorted(compareText)
      : [],
  /** @throws {TreeError} when the file cannot be read */
  read: (path: TreePath): string => readListed(AbsolutePath.join(input.root, path)),
});

interface GitFileTreesInput extends ChildProcessSettings {
  readonly maxFiles: number;
}

const createGitFileTrees = (git: GitFileTreesInput): FileTrees => ({
  installed: (folderPath: AbsolutePath): FileTree =>
    createFolderTree({
      maxFiles: git.maxFiles,
      root: folderPath,
    }),
  /** @throws {TreeError} when git fails or answers past its time */
  repository: (folderPath: AbsolutePath): FileTree =>
    createGitTree({
      ...git,
      root: AbsolutePath.create(
        runGit({
          ...git,
          args: [
            'rev-parse',
            '--show-toplevel',
          ],
          folder: folderPath,
        }).trim(),
      ),
    }),
  tracked: (folderPath: AbsolutePath): FileTree =>
    createGitTree({
      ...git,
      root: folderPath,
    }),
});

export { createGitFileTrees };
