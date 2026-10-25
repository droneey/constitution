import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { compareText, recognisedFailure } from '#/kernel/utils';
import { isSystemError } from '#/libs/system-error';

import type { FileTree, FileTrees } from '../../domain/contracts';
import { TreeError, TreeFailure } from '../../domain/errors';

const BYTE_ORDER_MARK = '﻿';
// A tree of many files lists past the 1 MiB that spawnSync keeps by default.
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

// A file the tree lists that the system refuses to read fails the tree, naming the file.
const readListed = (path: string): string => {
  try {
    return normalized(readFileSync(path, 'utf8'));
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

interface Git {
  readonly env: Readonly<Record<string, string>>;
  readonly timeoutMs: number;
}

// What git prints in the folder; a git that fails, or answers past its time, fails the tree.
const runGit = (
  input: Git & {
    args: readonly string[];
    folder: string;
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

// One adapter for the one system: the tree reads what git holds — an ignored
// file is no part of the Constitution, and CI sees only committed files.
const createGitTree = (
  input: Git & {
    root: string;
  },
): FileTree => ({
  list: (): readonly string[] =>
    [
      ...new Set(
        runGit({
          ...input,
          args: GIT_FILES,
          folder: input.root,
        }).split('\0'),
      ),
    ]
      .filter((path) => isFile(join(input.root, path)))
      .toSorted(compareText),
  read: (path: string): string => readListed(join(input.root, path)),
});

// The installed Constitution a pack extends, as mise unpacks it: no repository
// of its own, so its blocks are read from their folder.
const BASE_FOLDER = 'blocks';

const createFolderTree = (input: { root: string }): FileTree => ({
  list: (): readonly string[] =>
    existsSync(join(input.root, BASE_FOLDER))
      ? readdirSync(join(input.root, BASE_FOLDER), {
          recursive: true,
        })
          .map((path) => `${BASE_FOLDER}/${path}`)
          .filter((path) => isFile(join(input.root, path)))
          .toSorted(compareText)
      : [],
  read: (path: string): string => readListed(join(input.root, path)),
});

/** timeoutMs bounds each run of git. */
const createGitFileTrees = (git: Git): FileTrees => ({
  installed: (folder: string): FileTree =>
    createFolderTree({
      root: folder,
    }),
  repository: (folder: string): FileTree =>
    createGitTree({
      ...git,
      root: runGit({
        ...git,
        args: [
          'rev-parse',
          '--show-toplevel',
        ],
        folder,
      }).trim(),
    }),
  tracked: (folder: string): FileTree =>
    createGitTree({
      ...git,
      root: folder,
    }),
});

export { createGitFileTrees };
