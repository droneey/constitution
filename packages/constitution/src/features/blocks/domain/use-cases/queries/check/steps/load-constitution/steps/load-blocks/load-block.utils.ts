import { Axis } from '#/kernel/constants';
import type { Finding } from '#/kernel/types';
import { splitFrontMatter } from '#/kernel/utils';
import type { BlockFolder, FileInBlock } from '#/kernel/value-objects';
import { BlockFileKind, BlockFilePlace } from '#/kernel/value-objects';

import type { FileTree, FrontMatterParser } from '../../../../../../../contracts';
import type { PartFile } from '../../../../../../../entities';
import { Block, BlockFile, BlockOrigin } from '../../../../../../../entities';
import { readFrontMatter } from './front-matter.utils';

enum BlockLoadCode {
  SecondaryFrontMatter = 'front-matter-outside-passport',
  WithoutPassport = 'block-without-passport',
}

type PlacedFile = Exclude<
  FileInBlock,
  {
    readonly kind:
      | BlockFileKind.NamedAfterBlock
      | BlockFileKind.SeamOfNoBlockId
      | BlockFileKind.Stray;
  }
>;

interface Located {
  readonly file: PlacedFile;
  readonly folder: BlockFolder;
  readonly place: BlockFilePlace;
}

interface BlockGroup {
  readonly entries: readonly Located[];
  readonly folder: BlockFolder;
}

type PartPlace = Exclude<
  PlacedFile,
  {
    readonly kind: BlockFileKind.Passport;
  }
>;

interface Secondary {
  readonly file: PartPlace;
  readonly place: BlockFilePlace;
  readonly text: string;
}

interface BlockLoaded {
  readonly block?: Block;
  readonly findings: readonly Finding[];
}

const lineCount = (text: string): number => text.split('\n').length - (text.endsWith('\n') ? 1 : 0);

const groupByFolder = (located: readonly Located[]): readonly BlockGroup[] => {
  const groups = new Map<string, BlockGroup>();

  for (const entry of located) {
    groups.set(entry.folder.dir, {
      entries: [
        ...(groups.get(entry.folder.dir)?.entries ?? []),
        entry,
      ],
      folder: entry.folder,
    });
  }

  return [
    ...groups.values(),
  ];
};

const secondaryFindings = (secondary: readonly Secondary[]): readonly Finding[] =>
  secondary
    .filter(({ text }) => splitFrontMatter(text).frontMatter !== undefined)
    .map(({ place }) => ({
      code: BlockLoadCode.SecondaryFrontMatter,
      message: 'has front matter; only the passport of a block carries it',
      path: place.path,
    }));

const partOf = ({ file, place, text }: Secondary): PartFile => {
  const blockText = {
    axis: file.axis,
    body: text,
    lines: lineCount(text),
    path: place.path,
  };

  return file.kind === BlockFileKind.Seam
    ? BlockFile.seam(blockText, file.other)
    : BlockFile.chapter(blockText);
};

const loadBlock = (input: {
  group: BlockGroup;
  parser: FrontMatterParser;
  tree: FileTree;
}): BlockLoaded => {
  const { entries, folder } = input.group;
  const passport = entries.find((entry) => entry.file.kind === BlockFileKind.Passport);

  if (passport === undefined) {
    return {
      findings: [
        {
          code: BlockLoadCode.WithoutPassport,
          message: `has no passport ${folder.id}.md`,
          path: folder.dir,
        },
      ],
    };
  }

  const { path } = passport.place;
  const text = input.tree.read(path);
  const read = readFrontMatter({
    parser: input.parser,
    path,
    text,
  });

  if (read.frontMatter === undefined) {
    return {
      findings: read.findings,
    };
  }

  const secondary: readonly Secondary[] = entries
    .toSorted((left, right) => BlockFilePlace.compare(left.place, right.place))
    .flatMap(({ file, place }) =>
      file.kind === BlockFileKind.Passport
        ? []
        : [
            {
              file,
              place,
              text: input.tree.read(place.path),
            },
          ],
    );

  return {
    block: Block.create({
      frontMatter: read.frontMatter,
      id: folder.id,
      layer: folder.layer,
      origin: BlockOrigin.Own,
      parts: secondary.map(partOf),
      passport: BlockFile.passport({
        axis: Axis.Foundation,
        body: read.body,
        lines: lineCount(text),
        path,
      }),
    }),
    findings: secondaryFindings(secondary),
  };
};

export type { Located };
export { groupByFolder, loadBlock };
