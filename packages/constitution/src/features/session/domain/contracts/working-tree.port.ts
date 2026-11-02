import type { AbsolutePath } from '#/kernel/value-objects';

import type { FileSignatures } from '../entities';
import type { TreeFingerprint } from '../value-objects';

enum TreeStateStatus {
  Read = 'read',
  NoRepository = 'no-repository',
  Failed = 'failed',
}

type UnreadTree =
  | {
      readonly status: TreeStateStatus.NoRepository;
    }
  | {
      readonly reason: string;
      readonly status: TreeStateStatus.Failed;
    };

type TreeState =
  | {
      readonly fingerprint: TreeFingerprint;
      readonly status: TreeStateStatus.Read;
    }
  | UnreadTree;

type TreeSnapshot =
  | {
      readonly fileSignatures: FileSignatures;
      readonly status: TreeStateStatus.Read;
    }
  | UnreadTree;

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

export type { IgnoredAmongInput, IgnoredPaths, TreeSnapshot, TreeState, UnreadTree, WorkingTree };
export { IgnoreStatus, TreeStateStatus };
