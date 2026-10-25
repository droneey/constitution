import { Axis } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';
import { splitFrontMatter } from '#/kernel/utils';
import type { BlockFolder, BlockId, FileInBlock } from '#/kernel/value-objects';
import { BlockFileKind, BlockFilePlace } from '#/kernel/value-objects';

import type { FileTree, FrontMatterParser } from '../../../../../../../contracts';
import type { PartFile } from '../../../../../../../entities';
import { Block, BlockFile, BlockOrigin } from '../../../../../../../entities';
import type { FrontMatterReadFinding } from './front-matter.utils';
import { readFrontMatter } from './front-matter.utils';

enum BlockLoadCode {
  SecondaryFrontMatter = 'front-matter-outside-passport',
  WithoutPassport = 'block-without-passport',
}

interface BlockLoadDetails {
  readonly [BlockLoadCode.SecondaryFrontMatter]: object;
  readonly [BlockLoadCode.WithoutPassport]: {
    /** the id the folder names, whose passport is <id>.md */
    readonly id: BlockId;
  };
}

type BlockLoadFinding = FindingOf<BlockLoadDetails> | FrontMatterReadFinding;

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
  readonly findings: readonly BlockLoadFinding[];
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

const secondaryFindings = (secondary: readonly Secondary[]): readonly BlockLoadFinding[] =>
  secondary
    .filter(({ text }) => splitFrontMatter(text).frontMatter !== undefined)
    .map(({ place }) => ({
      code: BlockLoadCode.SecondaryFrontMatter,
      details: {},
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
          details: {
            id: folder.id,
          },
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

export type { BlockLoadDetails, BlockLoadFinding, Located };
export { BlockLoadCode, groupByFolder, loadBlock };
