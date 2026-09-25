import type { FileTree } from '#/features/constitution';
import { createNodeFileTree } from '#/features/constitution';

interface Wiring {
  console: {
    write: (text: string) => void;
  };
  fileTree: FileTree;
}

const createWiring = (input: { root: string }): Wiring => ({
  console: {
    write: (text: string): void => {
      process.stdout.write(text);
    },
  },
  fileTree: createNodeFileTree({
    root: input.root,
  }),
});

export type { Wiring };
export { createWiring };
