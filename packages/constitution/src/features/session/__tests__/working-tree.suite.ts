import { relative } from 'node:path';

import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import type { WorkingTree } from '../application/contracts';
import { IgnoreStatus } from '../application/contracts';
import type { TreeSnapshot } from '../domain/tree-state/entities';
import { TreeStateStatus } from '../domain/tree-state/entities';

enum RemoteMainLine {
  Absent = 'absent',
  BehindHead = 'behind-head',
  HoldsHead = 'holds-head',
}

interface WorkingTreeWorld {
  readonly committed: readonly string[];
  readonly ignored: readonly string[];
  readonly isWorktree: boolean;
  readonly mainLine: RemoteMainLine;
  readonly untracked: readonly string[];
}

interface WorkingTreeSuiteInput {
  readonly name: string;
  readonly treeOf: (world: WorkingTreeWorld) => {
    readonly elsewhere: AbsolutePath;
    readonly mainCheckoutFolderPath: AbsolutePath;
    readonly repositoryFolderPath: AbsolutePath;
    readonly tree: WorkingTree;
  };
}

const worldOf = (overrides: Partial<WorkingTreeWorld> = {}): WorkingTreeWorld => ({
  committed: [
    'a.txt',
  ],
  ignored: [],
  isWorktree: false,
  mainLine: RemoteMainLine.Absent,
  untracked: [
    'b.txt',
  ],
  ...overrides,
});

interface SnapshotFilesInput {
  readonly folderPath: AbsolutePath;
  readonly snapshot: TreeSnapshot;
}

const snapshotFilesOf = (input: SnapshotFilesInput): readonly string[] =>
  input.snapshot.status === TreeStateStatus.Read
    ? [
        ...input.snapshot.fileSignatures.keys(),
      ]
        .map((path) => relative(input.folderPath, path))
        .toSorted((left, right) => left.localeCompare(right))
    : [];

const runWorkingTreeSuite = (input: WorkingTreeSuiteInput): void => {
  describe(`${input.name}: the WorkingTree contract`, () => {
    it('should read the state of the project when it is a repository', () => {
      // Arrange
      const { repositoryFolderPath, tree } = input.treeOf(worldOf());

      // Act
      const state = tree.stateOf(repositoryFolderPath);

      // Assert
      expect(state.status).toBe(TreeStateStatus.Read);
    });

    it('should give the snapshot of a repository by each file changed since the commit', () => {
      // Arrange
      const { repositoryFolderPath, tree } = input.treeOf(worldOf());

      // Act
      const snapshot = tree.snapshotOf(repositoryFolderPath);

      // Assert
      expect(
        snapshotFilesOf({
          folderPath: repositoryFolderPath,
          snapshot,
        }),
      ).toStrictEqual([
        'b.txt',
      ]);
    });

    it.each([
      {
        operation: 'state',
        read: (tree: WorkingTree, folderPath: AbsolutePath) => tree.stateOf(folderPath),
      },
      {
        operation: 'snapshot',
        read: (tree: WorkingTree, folderPath: AbsolutePath) => tree.snapshotOf(folderPath),
      },
    ])('should give the $operation as no repository for a folder of no repository', ({ read }) => {
      // Arrange
      const { elsewhere, tree } = input.treeOf(worldOf());

      // Act
      const found = read(tree, elsewhere);

      // Assert
      expect(found).toStrictEqual({
        status: TreeStateStatus.NoRepository,
      });
    });

    it.each<{
      condition: string;
      ignored: readonly string[];
      path: string;
    }>([
      {
        condition: 'git ignores it',
        ignored: [
          'ignored.txt',
        ],
        path: 'ignored.txt',
      },
      {
        condition: 'git ignores the folder that holds it',
        ignored: [
          'build/out.js',
        ],
        path: 'build/out.js',
      },
      {
        condition: 'its name holds a line break',
        ignored: [
          'build/line\nbreak.js',
        ],
        path: 'build/line\nbreak.js',
      },
      {
        condition: 'git does not ignore it',
        ignored: [],
        path: 'b.txt',
      },
    ])('should tell which paths git ignores when $condition', ({ ignored, path }) => {
      // Arrange
      const { repositoryFolderPath, tree } = input.treeOf(
        worldOf({
          ignored: [
            'build',
            'ignored.txt',
          ],
        }),
      );

      // Act
      const told = tree.ignoredAmong({
        paths: [
          AbsolutePath.join(repositoryFolderPath, 'a.txt'),
          AbsolutePath.join(repositoryFolderPath, path),
        ],
        repositoryFolderPath,
      });

      // Assert
      expect(told).toStrictEqual({
        paths: new Set(
          ignored.map((ignoredPath) => AbsolutePath.join(repositoryFolderPath, ignoredPath)),
        ),
        status: IgnoreStatus.Told,
      });
    });

    it('should tell that git ignores none of no paths', () => {
      // Arrange
      const { elsewhere, tree } = input.treeOf(worldOf());

      // Act
      const told = tree.ignoredAmong({
        paths: [],
        repositoryFolderPath: elsewhere,
      });

      // Assert
      expect(told).toStrictEqual({
        paths: new Set(),
        status: IgnoreStatus.Told,
      });
    });

    it('should answer that it cannot tell which paths git ignores in a folder of no repository', () => {
      // Arrange
      const { elsewhere, tree } = input.treeOf(worldOf());

      // Act
      const answer = tree.ignoredAmong({
        paths: [
          AbsolutePath.join(elsewhere, 'b.txt'),
        ],
        repositoryFolderPath: elsewhere,
      });

      // Assert
      expect(answer).toStrictEqual({
        status: IgnoreStatus.Unknown,
      });
    });

    it.each([
      {
        condition: 'the project is the main checkout',
        isWorktree: false,
      },
      {
        condition: 'the project is a worktree',
        isWorktree: true,
      },
    ])('should give the main checkout of the repository when $condition', ({ isWorktree }) => {
      // Arrange
      const { mainCheckoutFolderPath, repositoryFolderPath, tree } = input.treeOf(
        worldOf({
          isWorktree,
        }),
      );

      // Act
      const mainCheckout = tree.mainCheckoutOf(repositoryFolderPath);

      // Assert
      expect(mainCheckout).toBe(mainCheckoutFolderPath);
    });

    it.each<{
      condition: string;
      isHeadHeld: boolean;
      mainLine: RemoteMainLine;
    }>([
      {
        condition: 'the remote main line holds its HEAD',
        isHeadHeld: true,
        mainLine: RemoteMainLine.HoldsHead,
      },
      {
        condition: 'the remote main line lags behind its HEAD',
        isHeadHeld: false,
        mainLine: RemoteMainLine.BehindHead,
      },
      {
        condition: 'the remote names no main line',
        isHeadHeld: false,
        mainLine: RemoteMainLine.Absent,
      },
    ])(
      'should tell whether the main line holds the HEAD when $condition',
      ({ isHeadHeld, mainLine }) => {
        // Arrange
        const { repositoryFolderPath, tree } = input.treeOf(
          worldOf({
            mainLine,
          }),
        );

        // Act
        const found = tree.mainLineOf(repositoryFolderPath);

        // Assert
        expect(found).toStrictEqual({
          isHeadHeld,
          status: TreeStateStatus.Read,
        });
      },
    );

    it('should give the main line as no repository for a folder of no repository', () => {
      // Arrange
      const { elsewhere, tree } = input.treeOf(
        worldOf({
          mainLine: RemoteMainLine.HoldsHead,
        }),
      );

      // Act
      const found = tree.mainLineOf(elsewhere);

      // Assert
      expect(found).toStrictEqual({
        status: TreeStateStatus.NoRepository,
      });
    });

    it('should give no main checkout for a folder of no repository', () => {
      // Arrange
      const { elsewhere, tree } = input.treeOf(worldOf());

      // Act
      const mainCheckout = tree.mainCheckoutOf(elsewhere);

      // Assert
      expect(mainCheckout).toBeUndefined();
    });
  });
};

export { RemoteMainLine, runWorkingTreeSuite, snapshotFilesOf };
