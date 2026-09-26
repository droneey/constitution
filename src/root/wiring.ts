import type {
  DigestWriter,
  FileTree,
  FrontMatterParser,
  ManifestParser,
} from '#/features/constitution';
import {
  createJsonManifestParser,
  createNodeFileSystem,
  createYamlFrontMatterParser,
} from '#/features/constitution';

interface Wiring {
  console: {
    write: (text: string) => void;
  };
  fileSystem: FileTree & DigestWriter;
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
}

const createWiring = (input: { root: string }): Wiring => ({
  console: {
    write: (text: string): void => {
      process.stdout.write(text);
    },
  },
  fileSystem: createNodeFileSystem({
    root: input.root,
  }),
  frontMatterParser: createYamlFrontMatterParser(),
  manifestParser: createJsonManifestParser(),
});

export type { Wiring };
export { createWiring };
