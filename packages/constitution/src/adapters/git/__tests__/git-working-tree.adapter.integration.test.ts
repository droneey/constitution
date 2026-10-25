import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import type { TreeState } from '#/kernel/contracts';
import { TreeStateStatus } from '#/kernel/contracts';
import { isWorkingTreeError, WorkingTreeFailure } from '#/kernel/errors';

import { createGitWorkingTree } from '../git-working-tree.adapter';

const TIMEOUT_MS = 30_000;

// A repository and a home of its own, so that no configuration of the machine reaches git.
let folder = '';
let project = '';
let env: Readonly<Record<string, string>> = {};

const write = (input: { path: string; text: string }): void => {
  mkdirSync(dirname(join(project, input.path)), {
    recursive: true,
  });
  writeFileSync(join(project, input.path), input.text);
};

const git = (args: readonly string[]): void => {
  execFileSync(
    'git',
    [
      '-c',
      'user.name=Spec',
      '-c',
      'user.email=spec@example.com',
      ...args,
    ],
    {
      cwd: project,
      env,
      stdio: 'ignore',
    },
  );
};

// One commit of a.txt and package.json files, then a.txt changed and b.txt left untracked.
const changedRepository = (): void => {
  git([
    'init',
    '--quiet',
  ]);
  write({
    path: '.gitignore',
    text: 'ignored.txt\n',
  });
  write({
    path: 'a.txt',
    text: 'one\n',
  });
  write({
    path: 'package.json',
    text: '{}\n',
  });
  write({
    path: 'пакет/package.json',
    text: '{}\n',
  });
  git([
    'add',
    '.',
  ]);
  git([
    'commit',
    '--quiet',
    '--message',
    'init',
  ]);
  write({
    path: 'a.txt',
    text: 'two\n',
  });
  write({
    path: 'b.txt',
    text: 'new\n',
  });
  write({
    path: 'ignored.txt',
    text: 'ignored\n',
  });
  write({
    path: 'apps/web/package.json',
    text: '{}\n',
  });
};

const readOf = (text: string): TreeState => ({
  bytes: new TextEncoder().encode(text),
  status: TreeStateStatus.Read,
});

// What a state says of git's failure: its code and whether it kept git's stderr where git ran and
// failed, whether its cause is an Error where git did not start or finish.
const failureOf = (
  state: TreeState,
):
  | {
      readonly code: WorkingTreeFailure;
      readonly hasStderr: boolean;
    }
  | {
      readonly isError: boolean;
    } => {
  const cause = state.status === TreeStateStatus.Unavailable ? state.cause : undefined;

  if (isWorkingTreeError(cause)) {
    return {
      code: cause.code,
      hasStderr: cause.details.stderr.trim() !== '',
    };
  }

  return {
    isError: cause instanceof Error,
  };
};

const gitFailed = {
  code: WorkingTreeFailure.GitFailed,
  hasStderr: true,
};
const notRun = {
  isError: true,
};

// A folder of one git, which answers nothing for longer than any spec waits.
const slowGitIn = (parent: string): string => {
  const bin = join(parent, 'bin');

  mkdirSync(bin);
  writeFileSync(join(bin, 'git'), '#!/bin/sh\n/bin/sleep 5\n');
  chmodSync(join(bin, 'git'), 0o755);

  return bin;
};

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'git-working-tree-'));
  project = join(folder, 'project');
  mkdirSync(project);
  mkdirSync(join(folder, 'home'));
  // the names git reads, as the root builds them
  env = Object.fromEntries([
    [
      'HOME',
      join(folder, 'home'),
    ],
    [
      'PATH',
      process.env['PATH'] ?? '',
    ],
  ]);
});

afterEach(() => {
  rmSync(folder, {
    force: true,
    recursive: true,
  });
});

describe('createGitWorkingTree', () => {
  it('should give the status and then the diff against HEAD as bytes when the tree has changed', () => {
    // Arrange
    changedRepository();

    const tree = createGitWorkingTree({
      env,
      timeoutMs: TIMEOUT_MS,
    });

    // Act
    const state = tree.stateOf(project);

    // Assert
    expect(state).toStrictEqual(
      readOf(
        [
          ' M a.txt',
          '?? apps/web/package.json',
          '?? b.txt',
          'diff --git a/a.txt b/a.txt',
          'index 5626abf..f719efd 100644',
          '--- a/a.txt',
          '+++ b/a.txt',
          '@@ -1 +1 @@',
          '-one',
          '+two',
          '',
        ].join('\n'),
      ),
    );
  });

  it('should give the status alone when the repository has no commit yet', () => {
    // Arrange
    git([
      'init',
      '--quiet',
    ]);
    write({
      path: 'a.txt',
      text: 'one\n',
    });

    const tree = createGitWorkingTree({
      env,
      timeoutMs: TIMEOUT_MS,
    });

    // Act
    const state = tree.stateOf(project);

    // Assert
    expect(state).toStrictEqual(readOf('?? a.txt\n'));
  });

  it('should give the state as unavailable, with what git wrote, when the status fails', () => {
    // Arrange
    changedRepository();
    git([
      'config',
      'status.renames',
      'bogus',
    ]);

    const tree = createGitWorkingTree({
      env,
      timeoutMs: TIMEOUT_MS,
    });

    // Act
    const state = tree.stateOf(project);

    // Assert
    expect(failureOf(state)).toStrictEqual(gitFailed);
  });

  it('should give the changed files and then the untracked ones, none ignored, when the tree has changed', () => {
    // Arrange
    changedRepository();

    const tree = createGitWorkingTree({
      env,
      timeoutMs: TIMEOUT_MS,
    });

    // Act
    const changed = tree.changedFiles(project);

    // Assert
    expect(changed).toStrictEqual([
      'a.txt',
      'apps/web/package.json',
      'b.txt',
    ]);
  });

  it('should give the tracked files of the names at any depth, unquoted, when the tree has them', () => {
    // Arrange
    changedRepository();

    const tree = createGitWorkingTree({
      env,
      timeoutMs: TIMEOUT_MS,
    });

    // Act
    const tracked = tree.trackedFiles({
      names: [
        'package.json',
        'a.txt',
      ],
      project,
    });

    // Assert
    expect(tracked).toStrictEqual([
      'a.txt',
      'package.json',
      'пакет/package.json',
    ]);
  });

  it.each([
    {
      condition: 'the folder is no repository',
      failure: gitFailed,
      setting: {},
      timeoutMs: TIMEOUT_MS,
    },
    {
      condition: 'git cannot be found',
      failure: notRun,
      setting: Object.fromEntries([
        [
          'PATH',
          '/nowhere',
        ],
      ]),
      timeoutMs: TIMEOUT_MS,
    },
    {
      condition: 'git does not answer within its time',
      failure: notRun,
      setting: Object.fromEntries([
        [
          'PATH',
          '<bin>',
        ],
      ]),
      timeoutMs: 200,
    },
  ])(
    'should give no files, and the state as unavailable with why, when $condition',
    ({ failure, setting, timeoutMs }) => {
      // Arrange
      write({
        path: 'a.txt',
        text: 'one\n',
      });

      const bin = slowGitIn(folder);
      const tree = createGitWorkingTree({
        env: {
          ...env,
          ...Object.fromEntries(
            Object.entries(setting).map(([name, folders]) => [
              name,
              folders.replace('<bin>', bin),
            ]),
          ),
        },
        timeoutMs,
      });

      // Act
      const seen = {
        changed: tree.changedFiles(project),
        failure: failureOf(tree.stateOf(project)),
        tracked: tree.trackedFiles({
          names: [
            'a.txt',
          ],
          project,
        }),
      };

      // Assert
      expect(seen).toStrictEqual({
        changed: [],
        failure,
        tracked: [],
      });
    },
  );
});
