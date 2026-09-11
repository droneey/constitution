import { parse } from 'yaml';

import type { FileTree } from './file-tree';
import type { Assembly, Block, Chapter, Constitution, Finding } from './models';
import {
  assemblyManifestSchema,
  blockManifestSchema,
  kindOfFolder,
} from './models';
import type { Parsed } from './parse-manifest';
import { parseManifest } from './parse-manifest';

const BLOCK_MANIFEST = /^blocks\/(?:core|([a-z]+)\/([a-z0-9-]+))\/block\.yml$/;
const ASSEMBLY = /^assemblies\/([a-z0-9-]+)\.yml$/;
const DECISIONS = 'DECISIONS.md';
const README = 'README.md';
const PLUGIN = '.claude-plugin/plugin.json';
const MARKETPLACE = '.claude-plugin/marketplace.json';
const HOOKS = 'hooks/hooks.json';

const optionalFile = (input: {
  path: string;
  paths: ReadonlySet<string>;
  tree: FileTree;
}): string | undefined =>
  input.paths.has(input.path) ? input.tree.read(input.path) : undefined;

interface Loaded {
  constitution: Constitution;
  findings: readonly Finding[];
}

const chaptersOf = (input: {
  dir: string;
  files: Readonly<Record<string, string>>;
  paths: ReadonlySet<string>;
  tree: FileTree;
}): readonly Chapter[] =>
  Object.entries(input.files)
    .map(([axis, file]) => ({
      axis,
      path: `${input.dir}/${file}`,
    }))
    .filter((chapter) => input.paths.has(chapter.path))
    .map((chapter) => ({
      ...chapter,
      text: input.tree.read(chapter.path),
    }));

const loadBlock = (input: {
  path: string;
  paths: ReadonlySet<string>;
  tree: FileTree;
}): Parsed<Block> => {
  const match = BLOCK_MANIFEST.exec(input.path);
  const folder = match?.[1];
  const name = match?.[2];
  const kind = folder === undefined ? 'core' : kindOfFolder(folder);

  if (kind === undefined) {
    return {
      finding: {
        message: `sits under "${folder}", which is not a kind of block`,
        path: input.path,
      },
    };
  }

  const dir = input.path.slice(0, -'/block.yml'.length);
  const parsed = parseManifest({
    format: 'YAML',
    parse,
    path: input.path,
    schema: blockManifestSchema,
    text: input.tree.read(input.path),
  });

  if (parsed.value === undefined) {
    return {
      finding: parsed.finding,
    };
  }

  return {
    value: {
      chapters: chaptersOf({
        dir,
        files: parsed.value.chapters,
        paths: input.paths,
        tree: input.tree,
      }),
      dir,
      id: name === undefined ? 'core' : `${folder}/${name}`,
      kind,
      manifest: parsed.value,
    },
  };
};

const loadAssembly = (input: {
  path: string;
  tree: FileTree;
}): Parsed<Assembly> => {
  const parsed = parseManifest({
    format: 'YAML',
    parse,
    path: input.path,
    schema: assemblyManifestSchema,
    text: input.tree.read(input.path),
  });

  if (parsed.value === undefined) {
    return {
      finding: parsed.finding,
    };
  }

  return {
    value: {
      fileName: ASSEMBLY.exec(input.path)?.[1] ?? '',
      manifest: parsed.value,
      path: input.path,
    },
  };
};

const collect = <T>(
  parsed: readonly Parsed<T>[],
): {
  findings: readonly Finding[];
  values: readonly T[];
} => ({
  findings: parsed.flatMap((item) =>
    item.finding === undefined
      ? []
      : [
          item.finding,
        ],
  ),
  values: parsed.flatMap((item) =>
    item.value === undefined
      ? []
      : [
          item.value,
        ],
  ),
});

const loadConstitution = (tree: FileTree): Loaded => {
  const listed = tree.list();
  const paths: ReadonlySet<string> = new Set(listed);
  const blocks = collect(
    listed
      .filter((path) => BLOCK_MANIFEST.test(path))
      .map((path) =>
        loadBlock({
          path,
          paths,
          tree,
        }),
      ),
  );
  const assemblies = collect(
    listed
      .filter((path) => ASSEMBLY.test(path))
      .map((path) =>
        loadAssembly({
          path,
          tree,
        }),
      ),
  );

  return {
    constitution: {
      assemblies: assemblies.values,
      blocks: blocks.values,
      decisions: optionalFile({
        path: DECISIONS,
        paths,
        tree,
      }),
      hooks: optionalFile({
        path: HOOKS,
        paths,
        tree,
      }),
      marketplace: optionalFile({
        path: MARKETPLACE,
        paths,
        tree,
      }),
      paths,
      plugin: optionalFile({
        path: PLUGIN,
        paths,
        tree,
      }),
      readme: optionalFile({
        path: README,
        paths,
        tree,
      }),
    },
    findings: [
      ...blocks.findings,
      ...assemblies.findings,
    ],
  };
};

export type { Loaded };
export { loadConstitution };
