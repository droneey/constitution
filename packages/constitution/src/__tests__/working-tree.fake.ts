import type { TreeState, WorkingTree } from '#/kernel/contracts';
import { TreeStateStatus } from '#/kernel/contracts';

// A working tree as git would report it: its state's text, or the failure that leaves it
// unavailable, its changed files and its tracked files.
interface FakeWorkingTree {
  readonly changed?: readonly string[];
  readonly state?: string | Error;
  readonly tracked?: readonly string[];
}

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

const createFakeWorkingTree = (tree: FakeWorkingTree = {}): WorkingTree => ({
  changedFiles: (): readonly string[] => tree.changed ?? [],
  stateOf: (): TreeState => stateOf(tree.state),
  trackedFiles: (input: { names: readonly string[] }): readonly string[] =>
    (tree.tracked ?? []).filter((path) =>
      input.names.includes(path.slice(path.lastIndexOf('/') + 1)),
    ),
});

export { createFakeWorkingTree };
