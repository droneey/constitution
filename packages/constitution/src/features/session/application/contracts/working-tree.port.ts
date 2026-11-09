import type { AbsolutePath } from '#/kernel/value-objects';

import type { TreeSnapshot, TreeState } from '../../domain/tree-state/entities';

enum IgnoreStatus {
  Told = 'told',
  Unknown = 'unknown',
}

type IgnoredPaths =
  | {
      readonly paths: ReadonlySet<AbsolutePath>;
      readonly status: IgnoreStatus.Told;
    }
  | {
      readonly status: IgnoreStatus.Unknown;
    };

interface IgnoredAmongInput {
  readonly paths: readonly AbsolutePath[];
  readonly repositoryFolderPath: AbsolutePath;
}

interface WorkingTree {
  readonly ignoredAmong: (input: IgnoredAmongInput) => IgnoredPaths;
  readonly mainCheckoutOf: (folderPath: AbsolutePath) => AbsolutePath | undefined;
  readonly snapshotOf: (repositoryFolderPath: AbsolutePath) => TreeSnapshot;
  readonly stateOf: (repositoryFolderPath: AbsolutePath) => TreeState;
}

export type { IgnoredAmongInput, IgnoredPaths, WorkingTree };
export { IgnoreStatus };
