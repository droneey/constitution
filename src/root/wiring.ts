import type {
  DigestWriter,
  FileTree,
  FrontMatterParser,
  ManifestParser,
  VocabularyParser,
} from '#/features/constitution';
import {
  createJsonManifestParser,
  createNodeFileSystem,
  createYamlFrontMatterParser,
  createYamlVocabularyParser,
} from '#/features/constitution';

interface Wiring {
  console: {
    write: (text: string) => void;
  };
  fileSystem: FileTree & DigestWriter;
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
  vocabularyParser: VocabularyParser;
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
  vocabularyParser: createYamlVocabularyParser(),
});

export type { Wiring };
export { createWiring };
