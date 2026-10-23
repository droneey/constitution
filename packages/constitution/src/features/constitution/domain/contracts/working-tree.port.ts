// What git says of a project's working tree.
interface WorkingTree {
  // the files changed since HEAD and those untracked, from the project's folder
  changedFiles: (project: string) => readonly string[];
  // the status of the tree and its diff from HEAD, empty where git gives nothing
  stateOf: (project: string) => Uint8Array;
  // the tracked files named one of names, in any folder, from the project's folder
  trackedFiles: (input: { names: readonly string[]; project: string }) => readonly string[];
}

export type { WorkingTree };
