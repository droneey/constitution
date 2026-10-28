import type { AbsolutePath, RepositoryRelativePath } from '#/kernel/value-objects';

import type { TreeFingerprint } from '../value-objects';

enum TreeStateStatus {
  Read = 'read',
  NoRepository = 'no-repository',
  Failed = 'failed',
}

type TreeState =
  | {
      readonly fingerprint: TreeFingerprint;
      readonly status: TreeStateStatus.Read;
    }
  | {
      readonly status: TreeStateStatus.NoRepository;
    }
  | {
      readonly reason: string;
      readonly status: TreeStateStatus.Failed;
    };

interface WorkingTree {
  readonly changedAndUntrackedFiles: (
    repositoryFolderPath: AbsolutePath,
  ) => readonly RepositoryRelativePath[];
  readonly stateOf: (repositoryFolderPath: AbsolutePath) => TreeState;
}

export type { TreeState, WorkingTree };
export { TreeStateStatus };
