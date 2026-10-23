import type { WorkingTree } from '../domain/contracts';

// A working tree as git would report it: its state's text, its changed files and its tracked files.
interface FakeWorkingTree {
  readonly changed?: readonly string[];
  readonly state?: string;
  readonly tracked?: readonly string[];
}

const createFakeWorkingTree = (tree: FakeWorkingTree = {}): WorkingTree => ({
  changedFiles: (): readonly string[] => tree.changed ?? [],
  stateOf: (): Uint8Array => new TextEncoder().encode(tree.state ?? ''),
  trackedFiles: (input: { names: readonly string[] }): readonly string[] =>
    (tree.tracked ?? []).filter((path) =>
      input.names.includes(path.slice(path.lastIndexOf('/') + 1)),
    ),
});

export { createFakeWorkingTree };
