import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { runWorkingTreeSuite } from '../../../__tests__/working-tree.suite';
import type { TreeState } from '../../../domain/entities';
import { TreeStateStatus } from '../../../domain/entities';
import { TreeFingerprint } from '../../../domain/value-objects';
import { createGitWorkingTree } from '../git-working-tree.adapter';

const TIMEOUT_MS = 30_000;

// Why: a repository and a home of its own, so that no configuration of the machine reaches git.
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

const readOf = (fingerprint: string): TreeState => ({
  fingerprint: TreeFingerprint.create(fingerprint),
  status: TreeStateStatus.Read,
});

const failureOf = (
  state: TreeState,
): {
  readonly isNamed: boolean;
  readonly status: TreeStateStatus;
} => ({
  isNamed:
    state.status === TreeStateStatus.Failed &&
    state.reason !== '' &&
    state.reason === state.reason.trim(),
  status: state.status,
});

const failed = {
  isNamed: true,
  status: TreeStateStatus.Failed,
};

const gitIn = (input: { parent: string; script: string }): string => {
  const bin = join(input.parent, 'bin');

  mkdirSync(bin);
  writeFileSync(join(bin, 'git'), `#!/bin/sh\n${input.script}\n`);
  chmodSync(join(bin, 'git'), 0o755);

  return bin;
};

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'git-working-tree-'));
  project = join(folder, 'project');
  mkdirSync(project);
  mkdirSync(join(folder, 'home'));
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
  it('should give the fingerprint of the status and then the diff against HEAD when the tree has changed', () => {
    // Arrange
    changedRepository();

    const tree = createGitWorkingTree({
      env,
      timeoutMs: TIMEOUT_MS,
    });

    // Act
    const state = tree.stateOf(AbsolutePath.create(project));

    // Assert
    expect(state).toStrictEqual(
      readOf('e4bbf951d86fc6f1c67c645989c137ad86c28fdab042bff6407641be04f7ace0'),
    );
  });

  it('should give the fingerprint of the status alone when the repository has no commit yet', () => {
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
    const state = tree.stateOf(AbsolutePath.create(project));

    // Assert
    expect(state).toStrictEqual(
      readOf('7c4099b5921da7c9dbdefeac9e7e5b83f0a14ddeca6d51f6ce0846df94ad2468'),
    );
  });

  it('should give the changed files and then the untracked ones, none ignored, when the tree has changed', () => {
    // Arrange
    changedRepository();

    const tree = createGitWorkingTree({
      env,
      timeoutMs: TIMEOUT_MS,
    });

    // Act
    const changed = tree.changedAndUntrackedFiles(AbsolutePath.create(project));

    // Assert
    expect<readonly string[]>(changed).toStrictEqual([
      'a.txt',
      'apps/web/package.json',
      'b.txt',
    ]);
  });

  it('should give the state as no repository when the environment names a locale git speaks otherwise in', () => {
    // Arrange
    const bin = gitIn({
      parent: folder,
      script:
        "[ \"$LC_ALL\" = C ] && echo 'fatal: not a git repository' >&2 || echo 'fatal: kein Git-Repository' >&2; exit 128",
    });
    const tree = createGitWorkingTree({
      env: {
        ...env,
        ...Object.fromEntries([
          [
            'LANG',
            'de_DE.UTF-8',
          ],
          [
            'PATH',
            bin,
          ],
        ]),
      },
      timeoutMs: TIMEOUT_MS,
    });

    // Act
    const state = tree.stateOf(AbsolutePath.create(project));

    // Assert
    expect(state).toStrictEqual({
      status: TreeStateStatus.NoRepository,
    });
  });

  it.each([
    {
      condition: 'git cannot be found',
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
      setting: Object.fromEntries([
        [
          'PATH',
          '<bin>',
        ],
      ]),
      timeoutMs: 200,
    },
  ])(
    'should give no files, and the state as failed with why, when $condition',
    ({ setting, timeoutMs }) => {
      // Arrange
      write({
        path: 'a.txt',
        text: 'one\n',
      });

      const bin = gitIn({
        parent: folder,
        script: '/bin/sleep 5',
      });
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
        changed: tree.changedAndUntrackedFiles(AbsolutePath.create(project)),
        failure: failureOf(tree.stateOf(AbsolutePath.create(project))),
      };

      // Assert
      expect<object>(seen).toStrictEqual({
        changed: [],
        failure: failed,
      });
    },
  );

  it('should give the state as failed, with what git wrote and without the blanks around it, when the status fails', () => {
    // Arrange
    const bin = gitIn({
      parent: folder,
      script: "echo '  fatal: broken  ' >&2; exit 128",
    });
    const tree = createGitWorkingTree({
      env: {
        ...env,
        ...Object.fromEntries([
          [
            'PATH',
            bin,
          ],
        ]),
      },
      timeoutMs: TIMEOUT_MS,
    });

    // Act
    const state = tree.stateOf(AbsolutePath.create(project));

    // Assert
    expect(state).toStrictEqual({
      reason: 'fatal: broken',
      status: TreeStateStatus.Failed,
    });
  });

  it('should give the state as failed, naming the status git ended with, when git fails and says nothing', () => {
    // Arrange
    const bin = gitIn({
      parent: folder,
      script: 'exit 3',
    });
    const tree = createGitWorkingTree({
      env: {
        ...env,
        ...Object.fromEntries([
          [
            'PATH',
            bin,
          ],
        ]),
      },
      timeoutMs: TIMEOUT_MS,
    });

    // Act
    const state = tree.stateOf(AbsolutePath.create(project));

    // Assert
    expect({
      isStatusNamed: state.status === TreeStateStatus.Failed && state.reason.endsWith(' 3'),
      status: state.status,
    }).toStrictEqual({
      isStatusNamed: true,
      status: TreeStateStatus.Failed,
    });
  });
});

runWorkingTreeSuite({
  name: 'createGitWorkingTree',
  treeOf: (world) => {
    git([
      'init',
      '--quiet',
    ]);

    for (const path of world.committed) {
      write({
        path,
        text: `${path}\n`,
      });
    }

    git([
      'add',
      '.',
    ]);
    git([
      'commit',
      '--quiet',
      '--allow-empty',
      '--message',
      'init',
    ]);

    for (const path of world.untracked) {
      write({
        path,
        text: `${path}\n`,
      });
    }

    mkdirSync(join(folder, 'elsewhere'));

    return {
      elsewhere: AbsolutePath.create(join(folder, 'elsewhere')),
      repositoryFolderPath: AbsolutePath.create(project),
      tree: createGitWorkingTree({
        env,
        timeoutMs: TIMEOUT_MS,
      }),
    };
  },
});
