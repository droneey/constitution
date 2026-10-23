import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { createGitWorkingTree } from '../git-working-tree.adapter';

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
    });

    // Act
    const state = tree.stateOf(project);

    // Assert
    expect(new TextDecoder().decode(state)).toBe(
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
    );
  });

  it('should give the status alone when the status fails, as the diff runs only after it', () => {
    // Arrange
    changedRepository();
    git([
      'config',
      'status.renames',
      'bogus',
    ]);
    const tree = createGitWorkingTree({
      env,
    });

    // Act
    const state = tree.stateOf(project);

    // Assert
    expect(state).toStrictEqual(new Uint8Array());
  });

  it('should give the changed files and then the untracked ones, none ignored, when the tree has changed', () => {
    // Arrange
    changedRepository();
    const tree = createGitWorkingTree({
      env,
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
      setting: {},
    },
    {
      condition: 'git cannot be found',
      setting: Object.fromEntries([
        [
          'PATH',
          '/nowhere',
        ],
      ]),
    },
  ])('should give an empty tree when $condition', ({ setting }) => {
    // Arrange
    write({
      path: 'a.txt',
      text: 'one\n',
    });
    const tree = createGitWorkingTree({
      env: {
        ...env,
        ...setting,
      },
    });

    // Act
    const seen = {
      changed: tree.changedFiles(project),
      state: tree.stateOf(project),
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
      state: new Uint8Array(),
      tracked: [],
    });
  });
});
