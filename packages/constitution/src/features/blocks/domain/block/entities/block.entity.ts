import type { Layer } from '#/kernel/constants';
import { Axis, LAYERS, PATH_SEPARATOR } from '#/kernel/constants';
import type { RuleSource } from '#/kernel/entities';
import type { FindingOf } from '#/kernel/types';
import { compareText, splitFrontMatter, withoutCodeFences } from '#/kernel/utils';
import type { BlockFolder } from '#/kernel/value-objects';
import { BlockFileKind, BlockFilePlace, BlockId } from '#/kernel/value-objects';

import type { TreePath } from '../../shared/value-objects';
import type { BlockGroup, PartFile, PassportFile } from './block-file.entity';
import { BlockFile } from './block-file.entity';
import type { FrontMatterProblem, FrontMatterRead } from './front-matter.entity';
import { FrontMatter, FrontMatterReadCode, FrontMatterStatus } from './front-matter.entity';

enum BlockOrigin {
  Own = 'own',
  Base = 'base',
}

interface Block {
  readonly frontMatter: FrontMatter;
  readonly id: BlockId;
  readonly layer: Layer;
  readonly origin: BlockOrigin;
  readonly parts: readonly PartFile[];
  readonly passport: PassportFile;
}

interface BlockPlace {
  readonly block: BlockId;
  readonly seam?: BlockId;
}

const linksOf = (block: Block): readonly BlockId[] => [
  ...block.frontMatter.requires,
  ...(block.frontMatter.extends === undefined
    ? []
    : [
        block.frontMatter.extends,
      ]),
];

const createBlock = (input: Block): Block => ({
  frontMatter: input.frontMatter,
  id: input.id,
  layer: input.layer,
  origin: input.origin,
  parts: input.parts,
  passport: input.passport,
});

const filesOf = (block: Block): readonly BlockFile[] => [
  block.passport,
  ...block.parts,
];

const asBase = (block: Block, folder: string): Block =>
  createBlock({
    ...block,
    origin: BlockOrigin.Base,
    parts: block.parts.map((file) =>
      BlockFile.withPath(file, `${folder}${PATH_SEPARATOR}${file.path}`),
    ),
    passport: BlockFile.withPath(
      block.passport,
      `${folder}${PATH_SEPARATOR}${block.passport.path}`,
    ),
  });

const placeOf = (block: Block, file: BlockFile): BlockPlace => {
  const seam = BlockFile.seamOf(file);

  return {
    block: block.id,
    ...(seam === undefined
      ? {}
      : {
          seam,
        }),
  };
};

const ruleSourcesOf = (block: Block): readonly RuleSource[] =>
  filesOf(block).map((file) => ({
    ...placeOf(block, file),
    axis: file.axis,
    file: file.path,
    text: withoutCodeFences(file.body),
  }));

const compare = (block: Block, other: Block): number =>
  LAYERS.indexOf(block.layer) - LAYERS.indexOf(other.layer) || compareText(block.id, other.id);

const isBase = (block: Block): boolean => block.origin === BlockOrigin.Base;

const sameAs = (block: Block, other: Block): boolean => BlockId.equals(block.id, other.id);

enum BlockLoadCode {
  SecondaryFrontMatter = 'front-matter-outside-passport',
  WithoutPassport = 'block-without-passport',
}

interface BlockLoadDetails {
  readonly [BlockLoadCode.SecondaryFrontMatter]: object;
  readonly [BlockLoadCode.WithoutPassport]: {
    readonly id: BlockId;
  };
}

type BlockLoadFinding =
  | FindingOf<BlockLoadDetails>
  | (FrontMatterProblem & {
      readonly path: string;
    });

enum BlockLoadStatus {
  Loaded = 'loaded',
  Unloaded = 'unloaded',
}

type BlockLoadStep<TLoaded> =
  | (TLoaded & {
      readonly status: BlockLoadStatus.Loaded;
    })
  | {
      readonly findings: readonly BlockLoadFinding[];
      readonly status: BlockLoadStatus.Unloaded;
    };

type PartEntry = Omit<BlockGroup['entries'][number], 'file' | 'folder'> & {
  readonly file: Exclude<
    BlockGroup['entries'][number]['file'],
    {
      readonly kind: BlockFileKind.Passport;
    }
  >;
};

type PartRead = PartEntry & {
  readonly text: string;
};

const unloaded = (findings: readonly BlockLoadFinding[]): BlockLoadStep<never> => ({
  findings,
  status: BlockLoadStatus.Unloaded,
});

const passportIn = (
  group: BlockGroup,
): BlockLoadStep<{
  readonly path: TreePath;
}> => {
  const passport = group.entries.find((entry) => entry.file.kind === BlockFileKind.Passport);

  return passport === undefined
    ? unloaded([
        {
          code: BlockLoadCode.WithoutPassport,
          details: {
            id: group.folder.id,
          },
          path: group.folder.dir,
        },
      ])
    : {
        path: passport.path,
        status: BlockLoadStatus.Loaded,
      };
};

const openPassport = (input: {
  path: TreePath;
  text: string;
}): BlockLoadStep<{
  readonly body: string;
  readonly frontMatter: string;
}> => {
  const opened = splitFrontMatter(input.text);

  return opened.frontMatter === undefined
    ? unloaded([
        {
          code: FrontMatterReadCode.Missing,
          details: {},
          path: input.path,
        },
      ])
    : {
        body: opened.body,
        frontMatter: opened.frontMatter,
        status: BlockLoadStatus.Loaded,
      };
};

const parsePassport = (input: {
  path: TreePath;
  read: FrontMatterRead;
}): BlockLoadStep<{
  readonly frontMatter: FrontMatter;
}> => {
  const parsed = FrontMatter.parse(input.read);

  return parsed.status === FrontMatterStatus.Invalid
    ? unloaded(
        parsed.problems.map((problem) => ({
          ...problem,
          path: input.path,
        })),
      )
    : {
        frontMatter: parsed.frontMatter,
        status: BlockLoadStatus.Loaded,
      };
};

const partsIn = (group: BlockGroup): readonly PartEntry[] =>
  group.entries
    .toSorted((left, right) => BlockFilePlace.compare(left.place, right.place))
    .flatMap(({ file, path, place }) =>
      file.kind === BlockFileKind.Passport
        ? []
        : [
            {
              file,
              path,
              place,
            },
          ],
    );

const lineCount = (text: string): number => text.split('\n').length - (text.endsWith('\n') ? 1 : 0);

const partOf = ({ file, path, text }: PartRead): PartFile => {
  const blockText = {
    axis: file.axis,
    body: text,
    lines: lineCount(text),
    path,
  };

  return file.kind === BlockFileKind.Seam
    ? BlockFile.seam(blockText, file.other)
    : BlockFile.chapter(blockText);
};

const secondaryFindings = (parts: readonly PartRead[]): readonly BlockLoadFinding[] =>
  parts
    .filter(({ text }) => splitFrontMatter(text).frontMatter !== undefined)
    .map(({ path }) => ({
      code: BlockLoadCode.SecondaryFrontMatter,
      details: {},
      path,
    }));

interface BlockFilesRead {
  readonly folder: BlockFolder;
  readonly frontMatter: FrontMatter;
  readonly parts: readonly PartRead[];
  readonly passport: {
    readonly body: string;
    readonly path: TreePath;
    readonly text: string;
  };
}

const fromFiles = (
  input: BlockFilesRead,
): {
  readonly block: Block;
  readonly findings: readonly BlockLoadFinding[];
} => ({
  block: createBlock({
    frontMatter: input.frontMatter,
    id: input.folder.id,
    layer: input.folder.layer,
    origin: BlockOrigin.Own,
    parts: input.parts.map(partOf),
    passport: BlockFile.passport({
      axis: Axis.Foundation,
      body: input.passport.body,
      lines: lineCount(input.passport.text),
      path: input.passport.path,
    }),
  }),
  findings: secondaryFindings(input.parts),
});

const Block = {
  asBase,
  compare,
  create: createBlock,
  filesOf,
  fromFiles,
  isBase,
  linksOf,
  openPassport,
  parsePassport,
  partsIn,
  passportIn,
  placeOf,
  ruleSourcesOf,
  sameAs,
} as const;

export type { BlockLoadDetails, BlockLoadFinding, BlockLoadStep, BlockPlace };
export { Block, BlockLoadCode, BlockLoadStatus, BlockOrigin };
