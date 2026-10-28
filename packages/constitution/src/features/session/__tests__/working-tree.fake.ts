import type { AbsolutePath } from '#/kernel/value-objects';
import { RepositoryRelativePath } from '#/kernel/value-objects';

import type { TreeState, WorkingTree } from '../domain/contracts';
import { TreeStateStatus } from '../domain/contracts';
import { TreeFingerprint } from '../domain/value-objects';

// A working tree as git would report it: its state's fingerprint, or the state git cannot report,
// and its changed files. Given its project, it answers for that folder alone, as git answers
// nothing for a folder of no repository.
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

// A tree no case names reports the same fingerprint every time.
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
    changedFiles: (repositoryFolderPath: AbsolutePath): readonly RepositoryRelativePath[] =>
      isOwn(repositoryFolderPath) ? (tree.changed ?? []).map(RepositoryRelativePath.create) : [],
    stateOf: (repositoryFolderPath: AbsolutePath): TreeState =>
      stateOf(isOwn(repositoryFolderPath) ? tree.state : noRepository),
  };
};

export { createFakeWorkingTree };
