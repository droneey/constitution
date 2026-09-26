import type {
  FileTree,
  FrontMatterParser,
  ManifestParser,
} from '#/features/constitution';
import {
  createJsonManifestParser,
  createNodeFileTree,
  createYamlFrontMatterParser,
} from '#/features/constitution';

interface Wiring {
  console: {
    write: (text: string) => void;
  };
  fileTree: FileTree;
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
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
  frontMatterParser: createYamlFrontMatterParser(),
  manifestParser: createJsonManifestParser(),
});

export type { Wiring };
export { createWiring };
