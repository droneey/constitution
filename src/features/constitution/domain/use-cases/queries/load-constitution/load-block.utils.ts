import type { Finding, Layer } from '#/kernel';
import { AXES, compareText } from '#/kernel';

import type { FileTree, FrontMatterParser } from '../../../contracts';
import type { Block, BlockFile } from '../../../entities';
import { BlockFileRole } from '../../../entities';
import { fileNameOf, splitFrontMatter } from '../../../utils';
import type { BlockPath } from './block-path.utils';
import { BlockPathFile } from './block-path.utils';
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

const lineCount = (text: string): number => text.split('\n').length - (text.endsWith('\n') ? 1 : 0);

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

const secondaryFindings = (secondary: readonly Secondary[]): readonly Finding[] =>
  secondary
    .filter(({ text }) => splitFrontMatter(text).frontMatter !== undefined)
    .map(({ entry }) => ({
      message: 'has front matter; only the main file of a block carries it',
      path: entry.path,
    }));

const secondaryFile = ({ entry, text }: Secondary): BlockFile => ({
  axis: entry.block.axis,
  body: text,
  lines: lineCount(text),
  path: entry.path,
  role: entry.block.file === BlockPathFile.With ? BlockFileRole.With : BlockFileRole.Chapter,
  with: entry.block.with,
});

const axisRank = (entry: Located): number => AXES.indexOf(entry.block.axis);

const nameRank = (input: { entry: Located; id: string }): 0 | 1 =>
  fileNameOf(input.entry.path) === `${input.id}.md` ? 0 : 1;

const compareSecondary =
  (id: string) =>
  (left: Secondary, right: Secondary): number =>
    axisRank(left.entry) - axisRank(right.entry) ||
    nameRank({
      entry: left.entry,
      id,
    }) -
      nameRank({
        entry: right.entry,
        id,
      }) ||
    compareText(left.entry.block.name, right.entry.block.name);

const filesOf = (input: {
  id: string;
  main: BlockFile;
  secondary: readonly Secondary[];
}): readonly BlockFile[] => {
  const ordered = input.secondary.toSorted(compareSecondary(input.id));

  return [
    input.main,
    ...ordered.filter(({ entry }) => entry.block.file === BlockPathFile.Chapter).map(secondaryFile),
    ...ordered.filter(({ entry }) => entry.block.file === BlockPathFile.With).map(secondaryFile),
  ];
};

const loadBlock = (input: {
  folder: BlockFolder;
  parser: FrontMatterParser;
  tree: FileTree;
}): BlockLoaded => {
  const { dir, entries, id, layer } = input.folder;
  const main = entries.find((entry) => entry.block.file === BlockPathFile.Main);

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
    .filter((entry) => entry.block.file !== BlockPathFile.Main)
    .map((entry) => ({
      entry,
      text: input.tree.read(entry.path),
    }));

  return {
    block: {
      files: filesOf({
        id,
        main: {
          axis: main.block.axis,
          body: read.body,
          lines: lineCount(text),
          path: main.path,
          role: BlockFileRole.Main,
          with: undefined,
        },
        secondary,
      }),
      frontMatter: read.frontMatter,
      id,
      layer,
      path: main.path,
    },
    findings: secondaryFindings(secondary),
  };
};

export type { Located };
export { groupByFolder, loadBlock };
