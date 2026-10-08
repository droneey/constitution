import type {
  BindingsParser,
  DigestWriter,
  FileTree,
  FrontMatterParser,
  ManifestParser,
  VocabularyParser,
} from '#/features/constitution';
import { createNodeFileSystem } from '#/features/constitution/adapters/file-system';
import { createJsonManifestParser } from '#/features/constitution/adapters/json';
import {
  createYamlBindingsParser,
  createYamlFrontMatterParser,
  createYamlVocabularyParser,
} from '#/features/constitution/adapters/yaml';

interface Wiring {
  bindingsParser: BindingsParser;
  console: {
    write: (text: string) => void;
  };
  fileSystem: FileTree & DigestWriter;
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
  vocabularyParser: VocabularyParser;
}

const createWiring = (input: { root: string }): Wiring => ({
  bindingsParser: createYamlBindingsParser(),
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
