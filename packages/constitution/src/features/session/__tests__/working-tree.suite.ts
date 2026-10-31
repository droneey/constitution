import { relative } from 'node:path';

import { describe, expect, it } from 'bun:test';

import type { AbsolutePath } from '#/kernel/value-objects';
import { RepositoryRelativePath } from '#/kernel/value-objects';

import type { TreeSnapshot, WorkingTree } from '../domain/contracts';
import { IgnoreAnswer, TreeStateStatus } from '../domain/contracts';

interface WorkingTreeWorld {
  readonly committed: readonly string[];
  readonly ignored: readonly string[];
  readonly isWorktree: boolean;
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

    it.each([
      {
        answer: IgnoreAnswer.Ignored,
        condition: 'git ignores it',
        path: 'ignored.txt',
      },
      {
        answer: IgnoreAnswer.NotIgnored,
        condition: 'git does not ignore it',
        path: 'b.txt',
      },
    ])('should tell whether git ignores a path when $condition', ({ answer, path }) => {
      // Arrange
      const { repositoryFolderPath, tree } = input.treeOf(
        worldOf({
          ignored: [
            'ignored.txt',
          ],
        }),
      );

      // Act
      const told = tree.isIgnored({
        path: RepositoryRelativePath.create(path),
        repositoryFolderPath,
      });

      // Assert
      expect(told).toBe(answer);
    });

    it('should answer that it cannot tell whether git ignores a path in a folder of no repository', () => {
      // Arrange
      const { elsewhere, tree } = input.treeOf(worldOf());

      // Act
      const answer = tree.isIgnored({
        path: RepositoryRelativePath.create('b.txt'),
        repositoryFolderPath: elsewhere,
      });

      // Assert
      expect(answer).toBe(IgnoreAnswer.Unknown);
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

export { runWorkingTreeSuite, snapshotFilesOf };
