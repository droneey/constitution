import { execFileSync, spawnSync } from 'node:child_process';
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { AbsolutePath, RepositoryRelativePath } from '#/kernel/value-objects';

import { runWorkingTreeSuite, snapshotFilesOf } from '../../../__tests__/working-tree.suite';
import type { TreeSnapshot, TreeState, WorkingTree } from '../../../domain/contracts';
import { IgnoreAnswer, TreeStateStatus } from '../../../domain/contracts';
import { ShellTree } from '../../../domain/entities';
import { TreeFingerprint } from '../../../domain/value-objects';
import { createGitWorkingTree } from '../git-working-tree.adapter';

const TIMEOUT_MS = 30_000;
const UNTRACKED_FILES_TIME_S = 1_000_000;

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

const committedRepository = (files: Readonly<Record<string, string>>): void => {
  git([
    'init',
    '--quiet',
  ]);

  for (const [path, text] of Object.entries(files)) {
    write({
      path,
      text,
    });
  }

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
};

const changedRepository = (): void => {
  committedRepository({
    '.gitignore': 'ignored.txt\n',
    'a.txt': 'one\n',
  });
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

  for (const path of [
    'b.txt',
    'apps/web/package.json',
  ]) {
    utimesSync(join(project, path), UNTRACKED_FILES_TIME_S, UNTRACKED_FILES_TIME_S);
  }
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

const treeWithGitIn = (script: string): WorkingTree =>
  createGitWorkingTree({
    env: {
      ...env,
      ...Object.fromEntries([
        [
          'PATH',
          gitIn({
            parent: folder,
            script,
          }),
        ],
      ]),
    },
    timeoutMs: TIMEOUT_MS,
  });

const projectPath = (): AbsolutePath => AbsolutePath.create(project);

const writeHome = (files: Readonly<Record<string, string>>): void => {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(folder, 'home', path)), {
      recursive: true,
    });
    writeFileSync(join(folder, 'home', path), text);
  }
};

const indexStatOf = (): {
  readonly inode: bigint;
  readonly modifiedNs: bigint;
} => {
  const stats = statSync(join(project, '.git', 'index'), {
    bigint: true,
  });

  return {
    inode: stats.ino,
    modifiedNs: stats.mtimeNs,
  };
};

const realTree = (): WorkingTree =>
  createGitWorkingTree({
    env,
    timeoutMs: TIMEOUT_MS,
  });

beforeEach(() => {
  folder = realpathSync(mkdtempSync(join(tmpdir(), 'git-working-tree-')));
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

const signaturesOf = (input: { path: string; snapshots: readonly TreeSnapshot[] }): number =>
  new Set(
    input.snapshots.map((snapshot) =>
      snapshot.status === TreeStateStatus.Read
        ? snapshot.fileSignatures.get(AbsolutePath.join(projectPath(), input.path))
        : undefined,
    ),
  ).size;

const fingerprintsOf = (states: readonly TreeState[]): number =>
  new Set(
    states.map((state) => (state.status === TreeStateStatus.Read ? state.fingerprint : undefined)),
  ).size;

const changedFilesOf = (input: { after: TreeSnapshot; before: TreeSnapshot }): readonly string[] =>
  input.before.status === TreeStateStatus.Read && input.after.status === TreeStateStatus.Read
    ? ShellTree.changedBetween(input.before.fileSignatures, input.after.fileSignatures).map(
        (path) => relative(project, path),
      )
    : [];

describe('createGitWorkingTree', () => {
  it('should give the fingerprint of the status, the diff of the work tree and the signatures of the untracked files when the tree has changed', () => {
    // Arrange
    changedRepository();

    const tree = realTree();

    // Act
    const state = tree.stateOf(projectPath());

    // Assert
    expect(state).toStrictEqual(
      readOf('2157cb5982e1d73662ac5db99f16fb28f3a853235dbadcdd90d83e3eb87af6e3'),
    );
  });

  it('should read the state of a repository that has no commit yet', () => {
    // Arrange
    git([
      'init',
      '--quiet',
    ]);
    write({
      path: 'a.txt',
      text: 'one\n',
    });
    git([
      'add',
      'a.txt',
    ]);
    write({
      path: 'a.txt',
      text: 'two\n',
    });

    const tree = realTree();

    // Act
    const state = tree.stateOf(projectPath());

    // Assert
    expect(state).toStrictEqual(
      readOf('298665e568ab60413ef1589f8184d67aca8fe53c23b6b25fc32d3d87ae5edda7'),
    );
  });

  it.each([
    {
      condition: 'the configuration names a program to diff with',
      configuration: {
        '.gitconfig': '[diff]\n\texternal = false\n',
      },
    },
    {
      condition: 'the attributes name a program to turn a file into text that does not exist',
      configuration: {
        '.config/git/attributes': '*.txt diff=converted\n',
        '.gitconfig': '[diff "converted"]\n\ttextconv = /nonexistent/convert\n',
      },
    },
  ])("should read the state by git's own diff when $condition", ({ configuration }) => {
    // Arrange
    changedRepository();
    writeHome(configuration);

    const tree = realTree();

    // Act
    const state = tree.stateOf(projectPath());

    // Assert
    expect(state).toStrictEqual(
      readOf('2157cb5982e1d73662ac5db99f16fb28f3a853235dbadcdd90d83e3eb87af6e3'),
    );
  });

  it.each([
    {
      operation: 'state',
      read: (tree: WorkingTree): TreeSnapshot | TreeState => tree.stateOf(projectPath()),
    },
    {
      operation: 'snapshot',
      read: (tree: WorkingTree): TreeSnapshot | TreeState => tree.snapshotOf(projectPath()),
    },
  ])(
    'should leave the index as it was when the $operation is read and the stat data it holds is stale',
    ({ read }) => {
      // Arrange
      committedRepository({
        'a.txt': 'one\n',
      });
      utimesSync(join(project, 'a.txt'), 1_000_000, 1_000_000);

      const tree = realTree();
      const before = indexStatOf();

      // Act
      read(tree);

      // Assert
      expect(indexStatOf()).toStrictEqual(before);
    },
  );

  it('should give a new fingerprint when an untracked file is rewritten', () => {
    // Arrange
    changedRepository();

    const tree = realTree();
    const before = tree.stateOf(projectPath());

    write({
      path: 'b.txt',
      text: 'rewritten by a command\n',
    });

    // Act
    const after = tree.stateOf(projectPath());

    // Assert
    expect(
      fingerprintsOf([
        before,
        after,
      ]),
    ).toBe(2);
  });

  it.each([
    {
      condition: 'git moved it',
      rename: (): void => {
        git([
          'mv',
          'abcdef.ts',
          'renamed.ts',
        ]);
      },
    },
    {
      condition: 'it was moved in the work tree and its new path is meant to be added',
      rename: (): void => {
        renameSync(join(project, 'abcdef.ts'), join(project, 'renamed.ts'));
        git([
          'add',
          '--intent-to-add',
          'renamed.ts',
        ]);
      },
    },
  ])('should name both paths of a renamed file when $condition', ({ rename }) => {
    // Arrange
    committedRepository({
      'abcdef.ts': 'export const one = 1;\n',
    });
    rename();

    const tree = realTree();

    // Act
    const snapshot = tree.snapshotOf(projectPath());

    // Assert
    expect(
      snapshotFilesOf({
        folderPath: projectPath(),
        snapshot,
      }),
    ).toStrictEqual([
      'abcdef.ts',
      'renamed.ts',
    ]);
  });

  it('should name a file both sides of a merge changed', () => {
    // Arrange
    committedRepository({
      'a.txt': 'one\n',
    });
    git([
      'checkout',
      '--quiet',
      '-b',
      'side',
    ]);
    write({
      path: 'a.txt',
      text: 'side\n',
    });
    git([
      'commit',
      '--quiet',
      '--all',
      '--message',
      'side',
    ]);
    git([
      'checkout',
      '--quiet',
      '-',
    ]);
    write({
      path: 'a.txt',
      text: 'main\n',
    });
    git([
      'commit',
      '--quiet',
      '--all',
      '--message',
      'main',
    ]);
    spawnSync(
      'git',
      [
        'merge',
        '--quiet',
        'side',
      ],
      {
        cwd: project,
        env,
      },
    );

    const tree = realTree();

    // Act
    const snapshot = tree.snapshotOf(projectPath());

    // Assert
    expect(
      snapshotFilesOf({
        folderPath: projectPath(),
        snapshot,
      }),
    ).toStrictEqual([
      'a.txt',
    ]);
  });

  it('should read a path that holds blanks or opens with a status letter whole', () => {
    // Arrange
    git([
      'init',
      '--quiet',
    ]);
    write({
      path: 'README.md',
      text: 'read me\n',
    });
    write({
      path: 'my notes.txt',
      text: 'notes\n',
    });

    const tree = realTree();

    // Act
    const snapshot = tree.snapshotOf(projectPath());

    // Assert
    expect(
      snapshotFilesOf({
        folderPath: projectPath(),
        snapshot,
      }),
    ).toStrictEqual([
      'my notes.txt',
      'README.md',
    ]);
  });

  it('should key each file by its path in the project when the project lies below the top of the repository', () => {
    // Arrange
    git([
      'init',
      '--quiet',
    ]);
    write({
      path: 'app/src/a.ts',
      text: 'export {};\n',
    });
    write({
      path: 'other.txt',
      text: 'other\n',
    });

    const tree = realTree();
    const app = AbsolutePath.join(projectPath(), 'app');

    // Act
    const snapshot = tree.snapshotOf(app);

    // Assert
    expect(
      snapshotFilesOf({
        folderPath: app,
        snapshot,
      }),
    ).toStrictEqual([
      'src/a.ts',
    ]);
  });

  it('should give a file a new signature when its time changes and its size does not', () => {
    // Arrange
    changedRepository();
    utimesSync(join(project, 'b.txt'), 1_000_000, 1_000_000);

    const tree = realTree();
    const before = tree.snapshotOf(projectPath());

    utimesSync(join(project, 'b.txt'), 2_000_000, 2_000_000);

    // Act
    const after = tree.snapshotOf(projectPath());

    // Assert
    expect(
      signaturesOf({
        path: 'b.txt',
        snapshots: [
          before,
          after,
        ],
      }),
    ).toBe(2);
  });

  it('should tell an untracked file a command rewrote from the snapshot before it', () => {
    // Arrange
    changedRepository();

    const tree = realTree();
    const before = tree.snapshotOf(projectPath());

    write({
      path: 'b.txt',
      text: 'rewritten by a command\n',
    });

    // Act
    const after = tree.snapshotOf(projectPath());

    // Assert
    expect(
      changedFilesOf({
        after,
        before,
      }),
    ).toStrictEqual([
      'b.txt',
    ]);
  });

  it("should leave the gate's own files out of the state", () => {
    // Arrange
    changedRepository();

    const tree = realTree();
    const before = tree.stateOf(projectPath());

    write({
      path: '.droneey/constitution-sessions/s1/parts/abc.1.md',
      text: 'rules\n',
    });

    // Act
    const after = tree.stateOf(projectPath());

    // Assert
    expect(after).toStrictEqual(before);
  });

  it("should leave the gate's own files out of the snapshot", () => {
    // Arrange
    changedRepository();
    write({
      path: '.droneey/constitution-sessions/s1/parts/abc.1.md',
      text: 'rules\n',
    });

    const tree = realTree();

    // Act
    const snapshot = tree.snapshotOf(projectPath());

    // Assert
    expect(
      snapshotFilesOf({
        folderPath: projectPath(),
        snapshot,
      }),
    ).toStrictEqual([
      'a.txt',
      'apps/web/package.json',
      'b.txt',
    ]);
  });

  it('should give no main checkout for a bare repository', () => {
    // Arrange
    git([
      'init',
      '--bare',
      '--quiet',
    ]);

    const tree = realTree();

    // Act
    const mainCheckout = tree.mainCheckoutOf(projectPath());

    // Assert
    expect(mainCheckout).toBeUndefined();
  });

  it('should give no main checkout when git fails, though it names a git folder', () => {
    // Arrange
    const tree = treeWithGitIn("echo '/work/project/.git'; exit 1");

    // Act
    const root = tree.mainCheckoutOf(projectPath());

    // Assert
    expect(root).toBeUndefined();
  });

  it('should answer that it cannot tell whether git ignores a path when git fails', () => {
    // Arrange
    const tree = treeWithGitIn("echo 'fatal: broken' >&2; exit 128");

    // Act
    const answer = tree.isIgnored({
      path: RepositoryRelativePath.create('b.txt'),
      repositoryFolderPath: projectPath(),
    });

    // Assert
    expect(answer).toBe(IgnoreAnswer.Unknown);
  });

  it('should give the state as no repository when the environment names a locale git speaks otherwise in', () => {
    // Arrange
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
            gitIn({
              parent: folder,
              script:
                "[ \"$LC_ALL\" = C ] && echo 'fatal: not a git repository' >&2 || echo 'fatal: kein Git-Repository' >&2; exit 128",
            }),
          ],
        ]),
      },
      timeoutMs: TIMEOUT_MS,
    });

    // Act
    const state = tree.stateOf(projectPath());

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
  ])('should give the state as failed with why when $condition', ({ setting, timeoutMs }) => {
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
    const failure = failureOf(tree.stateOf(projectPath()));

    // Assert
    expect(failure).toStrictEqual(failed);
  });

  it.each([
    {
      condition: 'the state is read and its status fails',
      failing: 'status',
      read: (tree: WorkingTree, folderPath: AbsolutePath): TreeSnapshot | TreeState =>
        tree.stateOf(folderPath),
    },
    {
      condition: 'the state is read and its diff fails',
      failing: 'diff-files',
      read: (tree: WorkingTree, folderPath: AbsolutePath): TreeSnapshot | TreeState =>
        tree.stateOf(folderPath),
    },
    {
      condition: 'the snapshot is read and the top of the repository cannot be found',
      failing: 'rev-parse',
      read: (tree: WorkingTree, folderPath: AbsolutePath): TreeSnapshot | TreeState =>
        tree.snapshotOf(folderPath),
    },
    {
      condition: 'the snapshot is read and its status fails',
      failing: 'status',
      read: (tree: WorkingTree, folderPath: AbsolutePath): TreeSnapshot | TreeState =>
        tree.snapshotOf(folderPath),
    },
  ])(
    'should give it as failed, with what git wrote and without the blanks around it, when $condition',
    ({ failing, read }) => {
      // Arrange
      const tree = treeWithGitIn(
        `[ "$2" = ${failing} ] && { echo '  fatal: broken  ' >&2; exit 128; }; echo '${project}'`,
      );

      // Act
      const found = read(tree, projectPath());

      // Assert
      expect(found).toStrictEqual({
        reason: 'fatal: broken',
        status: TreeStateStatus.Failed,
      });
    },
  );

  it('should give the state as failed, naming the status git ended with, when git fails and says nothing', () => {
    // Arrange
    const tree = treeWithGitIn('exit 3');

    // Act
    const state = tree.stateOf(projectPath());

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

    if (world.ignored.length > 0) {
      write({
        path: '.gitignore',
        text: `${world.ignored.join('\n')}\n`,
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

    const worktree = join(folder, 'worktree');

    if (world.isWorktree) {
      git([
        'worktree',
        'add',
        '--quiet',
        worktree,
      ]);
    }

    return {
      elsewhere: AbsolutePath.create(join(folder, 'elsewhere')),
      mainCheckoutFolderPath: projectPath(),
      repositoryFolderPath: AbsolutePath.create(world.isWorktree ? worktree : project),
      tree: realTree(),
    };
  },
});
