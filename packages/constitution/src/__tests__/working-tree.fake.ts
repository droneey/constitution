import type { TrackedFilesInput, TreeState, WorkingTree } from '#/kernel/contracts';
import { TreeStateStatus } from '#/kernel/contracts';

// A working tree as git would report it: its state's text, or the failure that leaves it
// unavailable, its changed files and its tracked files. Given its project, it answers for that
// folder alone, as git answers nothing for a folder of no repository.
interface FakeWorkingTree {
  readonly changed?: readonly string[];
  readonly project?: string;
  readonly state?: string | Error;
  readonly tracked?: readonly string[];
}

const noRepository = new Error('not a git repository');

const stateOf = (state: string | Error = ''): TreeState =>
  state instanceof Error
    ? {
        cause: state,
        status: TreeStateStatus.Unavailable,
      }
    : {
        bytes: new TextEncoder().encode(state),
        status: TreeStateStatus.Read,
      };

const createFakeWorkingTree = (tree: FakeWorkingTree = {}): WorkingTree => {
  const isOwn = (project: string): boolean =>
    tree.project === undefined || project === tree.project;

  return {
    changedFiles: (project: string): readonly string[] =>
      isOwn(project) ? (tree.changed ?? []) : [],
    stateOf: (project: string): TreeState => stateOf(isOwn(project) ? tree.state : noRepository),
    trackedFiles: (input: TrackedFilesInput): readonly string[] =>
      isOwn(input.project)
        ? (tree.tracked ?? []).filter((path) =>
            input.names.includes(path.slice(path.lastIndexOf('/') + 1)),
          )
        : [],
  };
};

export { createFakeWorkingTree };
