import type { Layer } from '#/kernel/constants';
import { AXES } from '#/kernel/constants';
import type { Finding } from '#/kernel/types';
import { compareText } from '#/kernel/utils';

import type { FileTree, FrontMatterParser } from '../../../contracts';
import type { Block, BlockFile } from '../../../entities';
import { BlockFileRole } from '../../../entities';
import { splitFrontMatter } from '../../../utils';
import type { PlacedPath } from './block-path.utils';
import { BlockPathFile } from './block-path.utils';
import { readFrontMatter } from './front-matter.utils';

enum BlockLoadCode {
  SecondaryFrontMatter = 'front-matter-outside-passport',
  WithoutPassport = 'block-without-passport',
}

interface Located {
  block: PlacedPath;
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
      code: BlockLoadCode.SecondaryFrontMatter,
      message: 'has front matter; only the passport of a block carries it',
      path: entry.path,
    }));

const ROLE_OF: Readonly<Record<PlacedPath['file'], BlockFileRole>> = {
  [BlockPathFile.Chapter]: BlockFileRole.Chapter,
  [BlockPathFile.Passport]: BlockFileRole.Passport,
  [BlockPathFile.With]: BlockFileRole.With,
};

const secondaryFile = ({ entry, text }: Secondary): BlockFile => ({
  axis: entry.block.axis,
  body: text,
  lines: lineCount(text),
  path: entry.path,
  role: ROLE_OF[entry.block.file],
  with: entry.block.with,
});

const compareFiles = (left: BlockFile, right: BlockFile): number =>
  AXES.indexOf(left.axis) - AXES.indexOf(right.axis) || compareText(left.path, right.path);

// After the passport, the chapters by axis, then the seams by axis.
const filesOf = (input: {
  passport: BlockFile;
  secondary: readonly Secondary[];
}): readonly BlockFile[] => {
  const ordered = input.secondary.map(secondaryFile).toSorted(compareFiles);

  return [
    input.passport,
    ...ordered.filter((file) => file.role !== BlockFileRole.With),
    ...ordered.filter((file) => file.role === BlockFileRole.With),
  ];
};

const loadBlock = (input: {
  folder: BlockFolder;
  parser: FrontMatterParser;
  tree: FileTree;
}): BlockLoaded => {
  const { dir, entries, id, layer } = input.folder;
  const passport = entries.find((entry) => entry.block.file === BlockPathFile.Passport);

  if (passport === undefined) {
    return {
      findings: [
        {
          code: BlockLoadCode.WithoutPassport,
          message: `has no passport ${id}.md`,
          path: dir,
        },
      ],
    };
  }

  const text = input.tree.read(passport.path);
  const read = readFrontMatter({
    parser: input.parser,
    path: passport.path,
    text,
  });

  if (read.frontMatter === undefined) {
    return {
      findings: read.findings,
    };
  }

  const secondary = entries
    .filter((entry) => entry.block.file !== BlockPathFile.Passport)
    .map((entry) => ({
      entry,
      text: input.tree.read(entry.path),
    }));

  return {
    block: {
      files: filesOf({
        passport: {
          axis: passport.block.axis,
          body: read.body,
          lines: lineCount(text),
          path: passport.path,
          role: BlockFileRole.Passport,
          with: undefined,
        },
        secondary,
      }),
      frontMatter: read.frontMatter,
      id,
      layer,
      path: passport.path,
    },
    findings: secondaryFindings(secondary),
  };
};

export type { Located };
export { groupByFolder, loadBlock };
