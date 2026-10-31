import type { AbsolutePath } from '#/kernel/value-objects';
import { RepositoryRelativePath } from '#/kernel/value-objects';

import type { WorkingTree } from '../application/contracts';
import type { TreeState } from '../domain/tree-state/entities';
import { TreeStateStatus } from '../domain/tree-state/entities';
import { TreeFingerprint } from '../domain/tree-state/value-objects';

interface FakeWorkingTree {
  readonly changed?: readonly string[];
  readonly repositoryFolderPath?: string;
  readonly state?: string | UnreadTree;
}

type UnreadTree = Exclude<
  TreeState,
  {
    readonly status: TreeStateStatus.Read;
  }
>;

const noRepository: UnreadTree = {
  status: TreeStateStatus.NoRepository,
};

const stateOf = (state: string | UnreadTree = 'tree'): TreeState =>
  typeof state === 'string'
    ? {
        fingerprint: TreeFingerprint.create(state),
        status: TreeStateStatus.Read,
      }
    : state;

const createFakeWorkingTree = (tree: FakeWorkingTree = {}): WorkingTree => {
  const isOwn = (repositoryFolderPath: AbsolutePath): boolean =>
    tree.repositoryFolderPath === undefined || repositoryFolderPath === tree.repositoryFolderPath;

  return {
    changedAndUntrackedFiles: (
      repositoryFolderPath: AbsolutePath,
    ): readonly RepositoryRelativePath[] =>
      isOwn(repositoryFolderPath) ? (tree.changed ?? []).map(RepositoryRelativePath.create) : [],
    stateOf: (repositoryFolderPath: AbsolutePath): TreeState =>
      stateOf(isOwn(repositoryFolderPath) ? tree.state : noRepository),
  };
};

export { createFakeWorkingTree };
