import type { AbsolutePath, RepositoryRelativePath } from '#/kernel/value-objects';

import type { TreeFingerprint } from '../value-objects';

enum TreeStateStatus {
  Read = 'read',
  /** the folder lies in no repository, which is a state of the project, not a fault */
  NoRepository = 'no-repository',
  /** git failed or did not answer in time */
  Failed = 'failed',
}

/** A working tree's status and its diff from HEAD, as git reports them, by their fingerprint. */
type TreeState =
  | {
      readonly fingerprint: TreeFingerprint;
      readonly status: TreeStateStatus.Read;
    }
  | {
      readonly status: TreeStateStatus.NoRepository;
    }
  | {
      /** what git or the system said of the failure, or the status git ended with */
      readonly reason: string;
      readonly status: TreeStateStatus.Failed;
    };

interface WorkingTree {
  /** the files changed since HEAD and those untracked; none where git lists none */
  readonly changedFiles: (repositoryFolderPath: AbsolutePath) => readonly RepositoryRelativePath[];
  readonly stateOf: (repositoryFolderPath: AbsolutePath) => TreeState;
}

export type { TreeState, WorkingTree };
export { TreeStateStatus };
