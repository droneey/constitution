import type {
  BindingsParser,
  FileTree,
  FrontMatterParser,
  ManifestParser,
  VocabularyParser,
} from '#/features/constitution';
import {
  createNodeBaseTree,
  createNodeFileSystem,
  repositoryRootOf,
} from '#/features/constitution/adapters/file-system';
import { createJsonManifestParser } from '#/features/constitution/adapters/json';
import {
  createYamlBindingsParser,
  createYamlFrontMatterParser,
  createYamlVocabularyParser,
} from '#/features/constitution/adapters/yaml';

interface Wiring {
  // The Constitution a pack extends, when the tree is a pack.
  base: FileTree | undefined;
  bindingsParser: BindingsParser;
  console: {
    write: (text: string) => void;
  };
  fileSystem: FileTree;
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
  repository: FileTree;
  vocabularyParser: VocabularyParser;
}

const createWiring = (input: { base: string | undefined; root: string }): Wiring => ({
  base:
    input.base === undefined
      ? undefined
      : createNodeBaseTree({
          root: input.base,
        }),
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
  repository: createNodeFileSystem({
    root: repositoryRootOf(input.root),
  }),
  vocabularyParser: createYamlVocabularyParser(),
});

export type { Wiring };
export { createWiring };
