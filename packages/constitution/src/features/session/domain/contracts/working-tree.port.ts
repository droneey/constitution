import type { AbsolutePath, RepositoryRelativePath } from '#/kernel/value-objects';

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

export type { IgnoredInput, TreeSnapshot, TreeState, UnreadTree, WorkingTree };
export { IgnoreAnswer, TreeStateStatus };
