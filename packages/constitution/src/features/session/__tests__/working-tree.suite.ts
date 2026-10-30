import { describe, expect, it } from 'bun:test';

import type { AbsolutePath } from '#/kernel/value-objects';

import type { WorkingTree } from '../application/contracts';
import { TreeStateStatus } from '../domain/tree-state/entities';

interface WorkingTreeWorld {
  readonly committed: readonly string[];
  readonly untracked: readonly string[];
}

interface WorkingTreeSuiteInput {
  readonly name: string;
  readonly treeOf: (world: WorkingTreeWorld) => {
    readonly elsewhere: AbsolutePath;
    readonly repositoryFolderPath: AbsolutePath;
    readonly tree: WorkingTree;
  };
}

const runWorkingTreeSuite = (input: WorkingTreeSuiteInput): void => {
  describe(`${input.name}: the WorkingTree contract`, () => {
    it('should give the files written since the commit as changed', () => {
      // Arrange
      const { repositoryFolderPath, tree } = input.treeOf({
        committed: [
          'a.txt',
        ],
        untracked: [
          'b.txt',
        ],
      });

      // Act
      const changed = tree.changedAndUntrackedFiles(repositoryFolderPath);

      // Assert
      expect<readonly string[]>(changed).toStrictEqual([
        'b.txt',
      ]);
    });

    it('should read the state of the project when it is a repository', () => {
      // Arrange
      const { repositoryFolderPath, tree } = input.treeOf({
        committed: [
          'a.txt',
        ],
        untracked: [],
      });

      // Act
      const state = tree.stateOf(repositoryFolderPath);

      // Assert
      expect(state.status).toBe(TreeStateStatus.Read);
    });

    it('should give no files, and the state as no repository, for a folder of no repository', () => {
      // Arrange
      const { elsewhere, tree } = input.treeOf({
        committed: [
          'a.txt',
        ],
        untracked: [
          'b.txt',
        ],
      });

      // Act
      const seen = {
        changed: tree.changedAndUntrackedFiles(elsewhere),
        state: tree.stateOf(elsewhere),
      };

      // Assert
      expect<object>(seen).toStrictEqual({
        changed: [],
        state: {
          status: TreeStateStatus.NoRepository,
        },
      });
    });
  });
};

export { runWorkingTreeSuite };
