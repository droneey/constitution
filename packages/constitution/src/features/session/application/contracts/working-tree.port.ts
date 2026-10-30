import type { AbsolutePath, RepositoryRelativePath } from '#/kernel/value-objects';

import type { TreeState } from '../../domain/tree-state/entities';

interface WorkingTree {
  readonly changedAndUntrackedFiles: (
    repositoryFolderPath: AbsolutePath,
  ) => readonly RepositoryRelativePath[];
  readonly stateOf: (repositoryFolderPath: AbsolutePath) => TreeState;
}

export type { WorkingTree };
