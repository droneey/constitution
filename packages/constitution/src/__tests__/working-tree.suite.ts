import { describe, expect, it } from 'bun:test';

import type { WorkingTree } from '#/kernel/contracts';
import { TreeStateStatus } from '#/kernel/contracts';

/** A project of one commit, then files written beside it. */
interface WorkingTreeWorld {
  /** the files of the commit, in the order git lists them */
  readonly committed: readonly string[];
  /** the files written since and never added */
  readonly untracked: readonly string[];
}

interface WorkingTreeSuiteInput {
  readonly name: string;
  /** a working tree over a project that holds the world, its folder and a folder of no repository */
  readonly treeOf: (world: WorkingTreeWorld) => {
    readonly elsewhere: string;
    readonly project: string;
    readonly tree: WorkingTree;
  };
}

const runWorkingTreeSuite = (input: WorkingTreeSuiteInput): void => {
  describe(`${input.name}: the WorkingTree contract`, () => {
    it('should give the files written since the commit as changed', () => {
      // Arrange
      const { project, tree } = input.treeOf({
        committed: [
          'a.txt',
        ],
        untracked: [
          'b.txt',
        ],
      });

      // Act
      const changed = tree.changedFiles(project);

      // Assert
      expect(changed).toStrictEqual([
        'b.txt',
      ]);
    });

    it('should give the tracked files of the names at any depth', () => {
      // Arrange
      const { project, tree } = input.treeOf({
        committed: [
          'a.txt',
          'apps/web/package.json',
          'package.json',
        ],
        untracked: [
          'apps/api/package.json',
        ],
      });

      // Act
      const tracked = tree.trackedFiles({
        names: [
          'package.json',
        ],
        project,
      });

      // Assert
      expect(tracked).toStrictEqual([
        'apps/web/package.json',
        'package.json',
      ]);
    });

    it('should read the state of the project when it is a repository', () => {
      // Arrange
      const { project, tree } = input.treeOf({
        committed: [
          'a.txt',
        ],
        untracked: [],
      });

      // Act
      const state = tree.stateOf(project);

      // Assert
      expect(state.status).toBe(TreeStateStatus.Read);
    });

    it('should give no files, and the state as unavailable, for a folder of no repository', () => {
      // Arrange
      const { elsewhere, tree } = input.treeOf({
        committed: [
          'package.json',
        ],
        untracked: [
          'b.txt',
        ],
      });

      // Act
      const seen = {
        changed: tree.changedFiles(elsewhere),
        status: tree.stateOf(elsewhere).status,
        tracked: tree.trackedFiles({
          names: [
            'package.json',
          ],
          project: elsewhere,
        }),
      };

      // Assert
      expect(seen).toStrictEqual({
        changed: [],
        status: TreeStateStatus.Unavailable,
        tracked: [],
      });
    });
  });
};

export { runWorkingTreeSuite };
