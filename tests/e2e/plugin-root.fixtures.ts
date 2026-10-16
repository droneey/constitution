import {
  copyFileSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
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
import { compareText } from '#/kernel/utils';

import type { Files } from './constitution.fixtures';
import { constitutionFiles } from './constitution.fixtures';

// A file the plugin root or the archive is built without, or the archive's
// package.json's version.
enum Breakage {
  DigestCore = 'digests/core.md',
  DigestFormat = 'digests/format',
  DigestIndex = 'digests/index.tsv',
  Resolve = 'hooks/lib/resolve.awk',
  Version = 'version',
}

interface PluginRootOptions {
  breakage?: Breakage;
  corePart?: string;
  // the text of digests/format
  format?: string;
}

const INSTALLED = '1.0.0';
const REPOSITORY = join(import.meta.dir, '..', '..');
const HOOKS = 'hooks';
const LIBRARY = 'hooks/lib';

const created: string[] = [];

const createFileTree = (files: Readonly<Files>): FileTree => ({
  list: (): readonly string[] => Object.keys(files).toSorted(compareText),
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
const writeDigestsOf = (input: { root: string; tree: FileTree }): void => {
  const prepared = prepareDigests({
    bindingsParser: createYamlBindingsParser(),
    frontMatterParser: createYamlFrontMatterParser(),
    manifestParser: createJsonManifestParser(),
    tree: input.tree,
    vocabularyParser: createYamlVocabularyParser(),
  });

  if (prepared.status === 'refused' || prepared.digests.findings.length > 0) {
    throw new Error('The constitution does not generate its digests');
  }

  writeDigests({
    digests: prepared.digests,
    writer: createNodeFileSystem({
      root: input.root,
    }),
  });
};

const PLUGIN = 'plugin';
const ARCHIVE = 'archive';
const LINK = '.droneey/constitution';

// The archive a plugin root's hooks are tested with: the release a project pins,
// which mise unpacks and links into the project.
const archiveOf = (root: string): string => join(dirname(root), ARCHIVE);

const writeManifest = (input: { folder: string; version: boolean }): void => {
  writeFileSync(
    join(input.folder, 'package.json'),
    `${JSON.stringify(
      {
        name: '@droneey/constitution',
        private: true,
        ...(input.version
          ? {
              version: INSTALLED,
            }
          : {}),
      },
      undefined,
      2,
    )}\n`,
  );
};

// The plugin brings the hooks; the archive beside it, the blocks and the
// digests generated from them, as a release packs them.
const createPluginRoot = (options: PluginRootOptions = {}): string => {
  const { breakage, corePart, format } = options;
  const folder = mkdtempSync(join(tmpdir(), 'constitution-plugin-'));
  const root = join(folder, PLUGIN);
  const archive = join(folder, ARCHIVE);
  const files = constitutionFiles();

  created.push(folder);
  copyHook(root);
  writeManifest({
    folder: root,
    version: true,
  });
  writeFiles({
    files,
    root: archive,
  });
  writeDigestsOf({
    root: archive,
    tree: createFileTree(files),
  });
  writeManifest({
    folder: archive,
    version: breakage !== Breakage.Version,
  });

  if (breakage === Breakage.Resolve) {
    rmSync(join(root, breakage));
  }

  if (
    breakage === Breakage.DigestCore ||
    breakage === Breakage.DigestFormat ||
    breakage === Breakage.DigestIndex
  ) {
    rmSync(join(archive, breakage));
  }

  if (corePart !== undefined) {
    writeFileSync(join(archive, 'digests', 'core.md'), corePart);
  }

  if (format !== undefined) {
    writeFileSync(join(archive, Breakage.DigestFormat), format);
  }

  return root;
};

// The plugin root a release of this repository ships, as far as the hook reads
// it, and the archive beside it: the digests generated from the real blocks,
// never committed, and the manifest.
const createRealPluginRoot = (): string => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-plugin-'));
  const root = join(folder, PLUGIN);
  const archive = join(folder, ARCHIVE);

  created.push(folder);
  copyHook(root);
  copyFileSync(join(REPOSITORY, 'package.json'), join(root, 'package.json'));
  writeDigestsOf({
    root: archive,
    tree: createNodeFileSystem({
      root: REPOSITORY,
    }),
  });
  copyFileSync(join(REPOSITORY, 'package.json'), join(archive, 'package.json'));

  return root;
};

// Links the archive into a project as mise's postinstall does, unless the
// project holds something there already; the project's git ignores the link,
// as a project's .gitignore does.
const linkArchive = (input: { archive: string; project: string }): void => {
  const link = join(input.project, LINK);

  if (
    lstatSync(link, {
      throwIfNoEntry: false,
    }) !== undefined
  ) {
    return;
  }

  mkdirSync(dirname(link), {
    recursive: true,
  });
  writeFileSync(join(dirname(link), '.gitignore'), '*\n');
  symlinkSync(input.archive, link);
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

export {
  archiveOf,
  Breakage,
  corePartOfBytes,
  createPluginRoot,
  createRealPluginRoot,
  INSTALLED,
  LINK,
  linkArchive,
  removeFolder,
  removePluginRoots,
};
