import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import type { FileTree } from '#/features/constitution';
import { prepareDigests, writeDigests } from '#/features/constitution';
import { createNodeFileSystem } from '#/features/constitution/adapters/file-system';
import { createJsonManifestParser } from '#/features/constitution/adapters/json';
import {
  createYamlBindingsParser,
  createYamlFrontMatterParser,
  createYamlVocabularyParser,
} from '#/features/constitution/adapters/yaml';

import type { Files } from './constitution.fixtures';
import { constitutionFiles } from './constitution.fixtures';

// A file the plugin root is built without, or its package.json's version.
enum Breakage {
  DigestCore = 'digests/core.md',
  DigestIndex = 'digests/index.tsv',
  Resolve = 'hooks/lib/resolve.awk',
  Version = 'version',
}

interface PluginRootOptions {
  breakage?: Breakage;
  corePart?: string;
}

const INSTALLED = '1.0.0';
const REPOSITORY = join(import.meta.dir, '..', '..');
const HOOKS = 'hooks';
const LIBRARY = 'hooks/lib';

const created: string[] = [];

const createFileTree = (files: Readonly<Files>): FileTree => ({
  list: (): readonly string[] => Object.keys(files).toSorted(),
  read: (path: string): string => {
    const text = files[path];

    if (text === undefined) {
      throw new Error(`The fixture constitution has no file ${path}`);
    }

    return text;
  },
});

const writeFiles = (input: { files: Readonly<Files>; root: string }): void => {
  for (const [path, text] of Object.entries(input.files)) {
    mkdirSync(dirname(join(input.root, path)), {
      recursive: true,
    });
    writeFileSync(join(input.root, path), text);
  }
};

const copyHook = (root: string): void => {
  mkdirSync(join(root, LIBRARY), {
    recursive: true,
  });
  for (const name of readdirSync(join(REPOSITORY, HOOKS)).filter((file) => file.endsWith('.sh'))) {
    copyFileSync(join(REPOSITORY, HOOKS, name), join(root, HOOKS, name));
  }

  for (const name of readdirSync(join(REPOSITORY, LIBRARY))) {
    copyFileSync(join(REPOSITORY, LIBRARY, name), join(root, LIBRARY, name));
  }
};

// The digests come from this repository's own generator, so the hook reads what
// a release ships.
const writeDigestsOf = (input: { files: Readonly<Files>; root: string }): void => {
  const prepared = prepareDigests({
    bindingsParser: createYamlBindingsParser(),
    frontMatterParser: createYamlFrontMatterParser(),
    manifestParser: createJsonManifestParser(),
    tree: createFileTree(input.files),
    vocabularyParser: createYamlVocabularyParser(),
  });

  if (prepared.status === 'refused' || prepared.digests.findings.length > 0) {
    throw new Error('The fixture constitution does not generate its digests');
  }

  writeDigests({
    digests: prepared.digests,
    writer: createNodeFileSystem({
      root: input.root,
    }),
  });
};

const createPluginRoot = (options: PluginRootOptions = {}): string => {
  const { breakage, corePart } = options;
  const root = mkdtempSync(join(tmpdir(), 'constitution-plugin-'));
  const files = constitutionFiles();

  created.push(root);
  writeFiles({
    files,
    root,
  });
  writeDigestsOf({
    files,
    root,
  });
  copyHook(root);
  writeFileSync(
    join(root, 'package.json'),
    `${JSON.stringify(
      {
        name: '@droneey/constitution',
        private: true,
        ...(breakage === Breakage.Version
          ? {}
          : {
              version: INSTALLED,
            }),
      },
      undefined,
      2,
    )}\n`,
  );

  if (breakage !== undefined && breakage !== Breakage.Version) {
    rmSync(join(root, breakage));
  }

  if (corePart !== undefined) {
    writeFileSync(join(root, 'digests', 'core.md'), corePart);
  }

  return root;
};

const removeFolder = (path: string): void => {
  rmSync(path, {
    force: true,
    recursive: true,
  });
};

const LINE_BYTES = 100;

// A core part of exactly `bytes` bytes, in lines of at most 100 with their
// newline, to put the budget's edge where a case needs it.
const corePartOfBytes = (bytes: number): string =>
  Array.from(
    {
      length: Math.ceil(bytes / LINE_BYTES),
    },
    (_, index) => `${'x'.repeat(Math.min(LINE_BYTES, bytes - index * LINE_BYTES) - 1)}\n`,
  ).join('');

const removePluginRoots = (): void => {
  for (const root of created.splice(0)) {
    removeFolder(root);
  }
};

export { Breakage, corePartOfBytes, createPluginRoot, INSTALLED, removeFolder, removePluginRoots };
