import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { TreeError, TreeFailure } from '../../../domain/errors';
import { createGitFileTrees } from '../git-file-trees.adapter';

// git as the program finds it: on the PATH the spec runs with.
const gitOptions = {
  env: Object.fromEntries([
    [
      'HOME',
      process.env['HOME'] ?? '',
    ],
    [
      'PATH',
      process.env['PATH'] ?? '',
    ],
  ]),
  timeoutMs: 30_000,
};

let root = '';

const write = (input: { path: string; text: string }): void => {
  mkdirSync(dirname(join(root, input.path)), {
    recursive: true,
  });
  writeFileSync(join(root, input.path), input.text);
};

const git = (args: readonly string[]): void => {
  execFileSync('git', args, {
    cwd: root,
    stdio: 'ignore',
  });
};

// What the tree fails with: its failure, the folder or file it names and the code of what the
// system failed with.
const failureOf = (act: () => unknown): unknown => {
  try {
    act();
  } catch (error) {
    if (error instanceof TreeError) {
      return {
        causeCode:
          error.cause instanceof Error && 'code' in error.cause ? error.cause.code : undefined,
        code: error.code,
        path: error.details.path,
      };
    }

    throw error;
  }

  return undefined;
};

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'git-file-trees-'));
  git([
    'init',
    '--quiet',
  ]);
});

afterEach(() => {
  rmSync(root, {
    force: true,
    recursive: true,
  });
});

describe('createGitFileTrees: tracked', () => {
  it('should list tracked and untracked files but no ignored or deleted one when the root is a repository', () => {
    // Arrange
    write({
      path: '.gitignore',
      text: 'local/\n.DS_Store\n',
    });
    write({
      path: 'blocks/core/core.md',
      text: '# Core\n',
    });
    write({
      path: 'gone.md',
      text: 'x\n',
    });
    git([
      'add',
      '.',
    ]);
    rmSync(join(root, 'gone.md'));
    write({
      path: 'blocks/domains/ui/ui.md',
      text: '# UI\n',
    });
    write({
      path: 'local/plan.md',
      text: '# Plan\n',
    });
    write({
      path: 'blocks/core/.DS_Store',
      text: '',
    });

    const fileSystem = createGitFileTrees(gitOptions).tracked(root);

    // Act
    const paths = fileSystem.list();

    // Assert
    expect(paths).toStrictEqual([
      '.gitignore',
      'blocks/core/core.md',
      'blocks/domains/ui/ui.md',
    ]);
  });

  it('should strip a byte-order mark and turn CRLF into LF when a file is read', () => {
    // Arrange
    write({
      path: 'blocks/core/core.md',
      text: '﻿---\r\nid: core\r\n---\r\n',
    });

    const fileSystem = createGitFileTrees(gitOptions).tracked(root);

    // Act
    const text = fileSystem.read('blocks/core/core.md');

    // Assert
    expect(text).toBe('---\nid: core\n---\n');
  });

  it('should fail the tree with the file when a file it lists cannot be read', () => {
    // Arrange
    write({
      path: 'blocks/core/core.md',
      text: '# Core\n',
    });
    chmodSync(join(root, 'blocks/core/core.md'), 0o000);

    const fileSystem = createGitFileTrees(gitOptions).tracked(root);

    // Act
    const failure = failureOf(() => fileSystem.read('blocks/core/core.md'));

    // Assert
    expect(failure).toStrictEqual({
      causeCode: 'EACCES',
      code: TreeFailure.Unreadable,
      path: join(root, 'blocks/core/core.md'),
    });
  });
});

describe('createGitFileTrees: repository', () => {
  it('should read the repository from its root when the folder sits in a package of it', () => {
    // Arrange
    write({
      path: 'packages/constitution/package.json',
      text: '{}\n',
    });

    // Act
    const listed = createGitFileTrees(gitOptions)
      .repository(join(root, 'packages', 'constitution'))
      .list();

    // Assert
    expect(listed).toStrictEqual([
      'packages/constitution/package.json',
    ]);
  });
});

describe('createGitFileTrees: installed', () => {
  it('should list the blocks of an unpacked Constitution in order and nothing else when it holds other folders', () => {
    // Arrange
    write({
      path: 'blocks/core/core.md',
      text: '# Core\r\n',
    });
    write({
      path: 'presets/common/biome/foundation/self.jsonc',
      text: '{}\n',
    });
    write({
      path: 'blocks/core/architecture/layout.md',
      text: '# Layout\n',
    });
    write({
      path: 'vocabulary.yaml',
      text: 'architecture: {}\n',
    });

    const tree = createGitFileTrees(gitOptions).installed(root);

    // Act
    const listed = tree.list();

    // Assert
    expect({
      core: tree.read('blocks/core/core.md'),
      listed,
    }).toStrictEqual({
      core: '# Core\n',
      listed: [
        'blocks/core/architecture/layout.md',
        'blocks/core/core.md',
      ],
    });
  });

  it('should list nothing when the folder holds no Constitution', () => {
    // Arrange
    const tree = createGitFileTrees(gitOptions).installed(root);

    // Act
    const listed = tree.list();

    // Assert
    expect(listed).toStrictEqual([]);
  });
});

describe('createGitFileTrees', () => {
  it('should read the folder, its repository and an installed Constitution each from where it starts when a pack sits in a repository', () => {
    // Arrange
    write({
      path: 'README.md',
      text: '# Packs\n',
    });
    write({
      path: 'pack/blocks/acme/acme.md',
      text: '# Acme\n',
    });
    write({
      path: 'base/blocks/core/core.md',
      text: '# Core\n',
    });

    const trees = createGitFileTrees(gitOptions);

    // Act
    const listed = {
      installed: trees.installed(join(root, 'base')).list(),
      repository: trees.repository(join(root, 'pack')).list(),
      tracked: trees.tracked(join(root, 'pack')).list(),
    };

    // Assert
    expect(listed).toStrictEqual({
      installed: [
        'blocks/core/core.md',
      ],
      repository: [
        'README.md',
        'base/blocks/core/core.md',
        'pack/blocks/acme/acme.md',
      ],
      tracked: [
        'blocks/acme/acme.md',
      ],
    });
  });
});

describe('createGitFileTrees: git', () => {
  // A git on PATH that runs the script given.
  const fakeGit = (input: { script: string; timeoutMs: number }): typeof gitOptions => {
    const folder = join(root, 'bin');

    write({
      path: 'bin/git',
      text: `#!/bin/sh\n${input.script}\n`,
    });
    chmodSync(join(folder, 'git'), 0o755);

    return {
      env: Object.fromEntries([
        [
          'HOME',
          root,
        ],
        [
          'PATH',
          folder,
        ],
      ]),
      timeoutMs: input.timeoutMs,
    };
  };

  it.each([
    {
      causeCode: 'ETIMEDOUT',
      code: TreeFailure.TimedOut,
      condition: 'git does not answer within its time',
      script: '/bin/sleep 5',
      timeoutMs: 200,
    },
    {
      causeCode: undefined,
      code: TreeFailure.Failed,
      condition: 'git fails',
      script: 'exit 128',
      timeoutMs: 30_000,
    },
  ])(
    'should fail the tree with $code, keeping why the run failed, when $condition',
    ({ causeCode, code, script, timeoutMs }) => {
      // Arrange
      const trees = createGitFileTrees(
        fakeGit({
          script,
          timeoutMs,
        }),
      );

      // Act
      const failure = failureOf(() => trees.tracked(root).list());

      // Assert
      expect(failure).toStrictEqual({
        causeCode,
        code,
        path: root,
      });
    },
  );

  it('should fail the repository with the folder it starts at when git cannot find its root', () => {
    // Arrange
    const trees = createGitFileTrees(
      fakeGit({
        script: 'exit 128',
        timeoutMs: 30_000,
      }),
    );

    // Act
    const act = (): unknown => trees.repository(join(root, 'pack'));

    // Assert
    expect(act).toThrow(
      new TreeError({
        code: TreeFailure.Failed,
        details: {
          path: join(root, 'pack'),
        },
      }),
    );
  });
});
