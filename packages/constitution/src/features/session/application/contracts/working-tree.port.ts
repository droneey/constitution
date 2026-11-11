import type { AbsolutePath } from '#/kernel/value-objects';

import type {
  HeldFiles,
  MainLine,
  TreeSnapshot,
  TreeState,
} from '../../domain/tree-state/entities';

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

interface PathsAmongInput {
  readonly paths: readonly AbsolutePath[];
  readonly repositoryFolderPath: AbsolutePath;
}

interface WorkingTree {
  readonly heldAmong: (input: PathsAmongInput) => HeldFiles;
  readonly ignoredAmong: (input: PathsAmongInput) => IgnoredPaths;
  readonly mainCheckoutOf: (folderPath: AbsolutePath) => AbsolutePath | undefined;
  readonly mainLineOf: (repositoryFolderPath: AbsolutePath) => MainLine;
  readonly snapshotOf: (repositoryFolderPath: AbsolutePath) => TreeSnapshot;
  readonly stateOf: (repositoryFolderPath: AbsolutePath) => TreeState;
}

export type { IgnoredPaths, PathsAmongInput, WorkingTree };
export { IgnoreStatus };
