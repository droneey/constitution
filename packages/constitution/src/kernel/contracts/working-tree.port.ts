enum TreeStateStatus {
  Read = 'read',
  /** git failed, found no repository or did not answer in time */
  Unavailable = 'unavailable',
}

/** The status of a working tree and its diff from HEAD, as git reports them. */
type TreeState =
  | {
      readonly bytes: Uint8Array;
      readonly status: TreeStateStatus.Read;
    }
  | {
      readonly cause: unknown;
      readonly status: TreeStateStatus.Unavailable;
    };

interface WorkingTree {
  /** the files changed since HEAD and those untracked, from the project's folder; none where git lists none */
  readonly changedFiles: (project: string) => readonly string[];
  readonly stateOf: (project: string) => TreeState;
  /** the tracked files named one of names, in any folder, from the project's folder; none where git lists none */
  readonly trackedFiles: (input: {
    names: readonly string[];
    project: string;
  }) => readonly string[];
}

export type { TreeState, WorkingTree };
export { TreeStateStatus };
