import type { AbsolutePath, RepositoryRelativePath } from '#/kernel/value-objects';

import type { TreeSnapshot, TreeState } from '../../domain/tree-state/entities';

enum IgnoreAnswer {
  Ignored = 'ignored',
  NotIgnored = 'not-ignored',
  Unknown = 'unknown',
}

interface IgnoredInput {
  readonly path: RepositoryRelativePath;
  readonly repositoryFolderPath: AbsolutePath;
}

interface WorkingTree {
  readonly isIgnored: (input: IgnoredInput) => IgnoreAnswer;
  readonly mainCheckoutOf: (folderPath: AbsolutePath) => AbsolutePath | undefined;
  readonly snapshotOf: (repositoryFolderPath: AbsolutePath) => TreeSnapshot;
  readonly stateOf: (repositoryFolderPath: AbsolutePath) => TreeState;
}

export type { IgnoredInput, WorkingTree };
export { IgnoreAnswer };
