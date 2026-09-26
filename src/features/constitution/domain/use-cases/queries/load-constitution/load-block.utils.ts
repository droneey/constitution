import type { Finding, Layer } from '#/kernel';
import { splitFrontMatter } from '#/libs/markdown';

import type { FileTree, FrontMatterParser } from '../../../contracts';
import type { Block, BlockFile } from '../../../entities';
import type { BlockPath } from './block-path.utils';
import { readFrontMatter } from './front-matter.utils';

interface Located {
  block: BlockPath;
  path: string;
}

interface BlockFolder {
  dir: string;
  entries: readonly Located[];
  id: string;
  layer: Layer;
}

interface Secondary {
  entry: Located;
  text: string;
}

interface BlockLoaded {
  block?: Block;
  findings: readonly Finding[];
}

const lineCount = (text: string): number =>
  (text.endsWith('\n') ? text.slice(0, -1) : text).split('\n').length;

const groupByFolder = (located: readonly Located[]): readonly BlockFolder[] => {
  const folders = new Map<
    string,
    BlockFolder & {
      entries: Located[];
    }
  >();

  for (const entry of located) {
    const folder = folders.get(entry.block.dir);

    if (folder === undefined) {
      folders.set(entry.block.dir, {
        dir: entry.block.dir,
        entries: [
          entry,
        ],
        id: entry.block.id,
        layer: entry.block.layer,
      });
    } else {
      folder.entries.push(entry);
    }
  }

  return [
    ...folders.values(),
  ];
};

const secondaryFindings = (input: {
  id: string;
  listed: readonly string[];
  mainPath: string;
  secondary: readonly Secondary[];
}): readonly Finding[] => {
  const chapters = input.secondary
    .map(({ entry }) => entry)
    .filter((entry) => entry.block.file === 'chapter');

  return [
    ...input.secondary
      .filter(({ text }) => splitFrontMatter(text).frontMatter !== undefined)
      .map(({ entry }) => ({
        message: 'has front matter; only the main file of a block carries it',
        path: entry.path,
      })),
    ...chapters
      .filter((entry) => !input.listed.includes(entry.block.name))
      .map((entry) => ({
        message: `is not listed in the chapters of ${input.id}`,
        path: entry.path,
      })),
    ...input.listed
      .filter((name) => !chapters.some((entry) => entry.block.name === name))
      .map((name) => ({
        message: `lists the chapter ${name}, which does not exist`,
        path: input.mainPath,
      })),
  ];
};

const secondaryFile = ({ entry, text }: Secondary): BlockFile => ({
  body: text,
  lines: lineCount(text),
  path: entry.path,
  role: entry.block.file === 'with' ? 'with' : 'chapter',
  with: entry.block.with,
});

const filesOf = (input: {
  listed: readonly string[];
  main: BlockFile;
  secondary: readonly Secondary[];
}): readonly BlockFile[] => [
  input.main,
  ...input.listed.flatMap((name) =>
    input.secondary
      .filter(
        ({ entry }) =>
          entry.block.file === 'chapter' && entry.block.name === name,
      )
      .map(secondaryFile),
  ),
  ...input.secondary
    .filter(({ entry }) => entry.block.file === 'with')
    .map(secondaryFile),
];

const loadBlock = (input: {
  folder: BlockFolder;
  parser: FrontMatterParser;
  tree: FileTree;
}): BlockLoaded => {
  const { dir, entries, id, layer } = input.folder;
  const main = entries.find((entry) => entry.block.file === 'main');

  if (main === undefined) {
    return {
      findings: [
        {
          message: `has no main file ${id}.md`,
          path: dir,
        },
      ],
    };
  }

  const text = input.tree.read(main.path);
  const read = readFrontMatter({
    parser: input.parser,
    path: main.path,
    text,
  });

  if (read.frontMatter === undefined) {
    return {
      findings: read.findings,
    };
  }

  const secondary = entries
    .filter((entry) => entry.block.file !== 'main')
    .map((entry) => ({
      entry,
      text: input.tree.read(entry.path),
    }));

  return {
    block: {
      files: filesOf({
        listed: read.frontMatter.chapters,
        main: {
          body: read.body,
          lines: lineCount(text),
          path: main.path,
          role: 'main',
          with: undefined,
        },
        secondary,
      }),
      frontMatter: read.frontMatter,
      id,
      layer,
      path: main.path,
    },
    findings: secondaryFindings({
      id,
      listed: read.frontMatter.chapters,
      mainPath: main.path,
      secondary,
    }),
  };
};

export type { BlockFolder, Located };
export { groupByFolder, loadBlock };
