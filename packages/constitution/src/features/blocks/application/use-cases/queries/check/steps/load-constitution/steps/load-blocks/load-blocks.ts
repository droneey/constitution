import { Axis, BLOCKS_FOLDER_NAME, PATH_SEPARATOR } from '#/kernel/constants';
import type { ValueFindingDetails } from '#/kernel/entities';
import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import { firstBy, splitFrontMatter } from '#/kernel/utils';
import type { BlockFolder, BlockId, FileInBlock } from '#/kernel/value-objects';
import { BlockFileKind, BlockFilePlace, Placement } from '#/kernel/value-objects';

import type { FileTree, FrontMatterParser } from '../../../../../../../contracts';
import type { FrontMatterProblem, PartFile } from '../../../../../../../../domain/entities';
import {
  Block,
  BlockFile,
  BlockOrigin,
  FrontMatter,
  FrontMatterReadCode,
  FrontMatterStatus,
} from '../../../../../../../../domain/entities';
import { TreePath } from '../../../../../../../../domain/value-objects';

enum PlaceCode {
  OutsideBlockFolder = 'outside-block-folder',
  StrayBlockFile = 'stray-block-file',
  ChapterNamedAfterBlock = 'chapter-named-after-its-block',
}

interface PlaceDetails {
  readonly [PlaceCode.OutsideBlockFolder]: object;
  readonly [PlaceCode.StrayBlockFile]: object;
  readonly [PlaceCode.ChapterNamedAfterBlock]: object;
}

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

type PlaceProblem = ProblemOf<PlaceDetails & Pick<ValueFindingDetails, ValueFailure.BlockId>>;

type BlocksLoadedFinding =
  | FindingOf<BlockLoadDetails & PlaceDetails & Pick<ValueFindingDetails, ValueFailure.BlockId>>
  | (FrontMatterProblem & {
      readonly path: string;
    });

type UnplacedFile =
  | BlockFileKind.NamedAfterBlock
  | BlockFileKind.SeamOfNoBlockId
  | BlockFileKind.Stray;

type PlacedFile = Exclude<
  FileInBlock,
  {
    readonly kind: UnplacedFile;
  }
>;

type PartPlace = Exclude<
  PlacedFile,
  {
    readonly kind: BlockFileKind.Passport;
  }
>;

const blocksPrefix = `${BLOCKS_FOLDER_NAME}${PATH_SEPARATOR}`;

const UNPLACED = {
  [BlockFileKind.NamedAfterBlock]: {
    code: PlaceCode.ChapterNamedAfterBlock,
    details: {},
  },
  [BlockFileKind.SeamOfNoBlockId]: {
    code: ValueFailure.BlockId,
    details: {
      site: ValueSite.SeamFile,
    },
  },
  [BlockFileKind.Stray]: {
    code: PlaceCode.StrayBlockFile,
    details: {},
  },
} as const satisfies Readonly<Record<UnplacedFile, PlaceProblem>>;

const isPlaced = (file: FileInBlock): file is PlacedFile => !Object.hasOwn(UNPLACED, file.kind);

interface Located {
  readonly file: PlacedFile;
  readonly folder: BlockFolder;
  readonly path: TreePath;
  readonly place: BlockFilePlace;
}

interface Unplaced {
  readonly file: UnplacedFile;
  readonly path: TreePath;
}

interface Misnamed {
  readonly dir: TreePath;
  readonly name: string;
}

interface Location {
  readonly misnamed: readonly Misnamed[];
  readonly outside: readonly TreePath[];
  readonly placed: readonly Located[];
  readonly unplaced: readonly Unplaced[];
}

interface BlockGroup {
  readonly entries: readonly Located[];
  readonly folder: BlockFolder;
}

interface Part {
  readonly file: PartPlace;
  readonly path: TreePath;
  readonly place: BlockFilePlace;
  readonly text: string;
}

enum LoadStatus {
  Loaded = 'loaded',
  Unloaded = 'unloaded',
}

type BlockLoaded =
  | {
      readonly block: Block;
      readonly findings: readonly BlocksLoadedFinding[];
      readonly status: LoadStatus.Loaded;
    }
  | {
      readonly findings: readonly BlocksLoadedFinding[];
      readonly status: LoadStatus.Unloaded;
    };

const locate = (paths: readonly TreePath[]): Location => {
  const places = paths.map((path) => ({
    path,
    place: BlockFilePlace.parse(path),
  }));
  const inBlock = places.flatMap(({ path, place }) =>
    place?.placement === Placement.InBlock
      ? [
          {
            file: place.file,
            folder: place.folder,
            path,
            place,
          },
        ]
      : [],
  );
  const misnamed = places.flatMap(({ place }): readonly Misnamed[] =>
    place?.placement === Placement.MisnamedFolder
      ? [
          {
            dir: TreePath.create(place.dir),
            name: place.name,
          },
        ]
      : [],
  );

  return {
    misnamed: [
      ...firstBy(misnamed, (folder) => folder.dir).values(),
    ],
    outside: places.flatMap(({ path, place }) =>
      place === undefined || place.placement === Placement.Loose
        ? [
            path,
          ]
        : [],
    ),
    placed: inBlock.flatMap(({ file, ...rest }) =>
      isPlaced(file)
        ? [
            {
              ...rest,
              file,
            },
          ]
        : [],
    ),
    unplaced: inBlock.flatMap(({ file, path }) =>
      isPlaced(file)
        ? []
        : [
            {
              file: file.kind,
              path,
            },
          ],
    ),
  };
};

const groupByFolder = (located: readonly Located[]): readonly BlockGroup[] =>
  [
    ...firstBy(located, (entry) => entry.folder.dir).values(),
  ].map(({ folder }) => ({
    entries: located.filter((entry) => entry.folder.dir === folder.dir),
    folder,
  }));

const lineCount = (text: string): number => text.split('\n').length - (text.endsWith('\n') ? 1 : 0);

const partOf = ({ file, path, text }: Part): PartFile => {
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

const secondaryFindings = (parts: readonly Part[]): readonly BlocksLoadedFinding[] =>
  parts
    .filter(({ text }) => splitFrontMatter(text).frontMatter !== undefined)
    .map(({ path }) => ({
      code: BlockLoadCode.SecondaryFrontMatter,
      details: {},
      path,
    }));

/** @throws {TreeError} when a file of the block cannot be read */
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
      status: LoadStatus.Unloaded,
    };
  }

  const { path } = passport;
  const text = input.tree.read(path);
  const opened = splitFrontMatter(text);

  if (opened.frontMatter === undefined) {
    return {
      findings: [
        {
          code: FrontMatterReadCode.Missing,
          details: {},
          path,
        },
      ],
      status: LoadStatus.Unloaded,
    };
  }

  const parsed = FrontMatter.parse(input.parser.parse(opened.frontMatter));

  if (parsed.status === FrontMatterStatus.Invalid) {
    return {
      findings: parsed.problems.map((problem) => ({
        ...problem,
        path,
      })),
      status: LoadStatus.Unloaded,
    };
  }

  const parts: readonly Part[] = entries
    .toSorted((left, right) => BlockFilePlace.compare(left.place, right.place))
    .flatMap(({ file, path: partPath, place }) =>
      file.kind === BlockFileKind.Passport
        ? []
        : [
            {
              file,
              path: partPath,
              place,
              text: input.tree.read(partPath),
            },
          ],
    );

  return {
    block: Block.create({
      frontMatter: parsed.frontMatter,
      id: folder.id,
      layer: folder.layer,
      origin: BlockOrigin.Own,
      parts: parts.map(partOf),
      passport: BlockFile.passport({
        axis: Axis.Foundation,
        body: opened.body,
        lines: lineCount(text),
        path,
      }),
    }),
    findings: secondaryFindings(parts),
    status: LoadStatus.Loaded,
  };
};

interface BlocksLoaded {
  readonly blocks: readonly Block[];
  readonly findings: readonly BlocksLoadedFinding[];
}

interface LoadBlocksInput {
  readonly parser: FrontMatterParser;
  readonly tree: FileTree;
}

/** @throws {TreeError} when git cannot list the files, or a file of a block cannot be read */
const loadBlocks = (input: LoadBlocksInput): BlocksLoaded => {
  const underBlocks = input.tree.list().filter((path) => path.startsWith(blocksPrefix));
  const located = locate(underBlocks);
  const loaded = groupByFolder(located.placed).map((group) =>
    loadBlock({
      group,
      parser: input.parser,
      tree: input.tree,
    }),
  );

  return {
    blocks: loaded.flatMap((outcome) =>
      outcome.status === LoadStatus.Loaded
        ? [
            outcome.block,
          ]
        : [],
    ),
    findings: [
      ...located.outside.map(
        (path): BlocksLoadedFinding => ({
          code: PlaceCode.OutsideBlockFolder,
          details: {},
          path,
        }),
      ),
      ...located.misnamed.map(
        ({ dir, name }): BlocksLoadedFinding => ({
          code: ValueFailure.BlockId,
          details: {
            site: ValueSite.BlockFolder,
            written: name,
          },
          path: dir,
        }),
      ),
      ...located.unplaced.map(({ file, path }) => ({
        ...UNPLACED[file],
        path,
      })),
      ...loaded.flatMap((outcome) => outcome.findings),
    ],
  };
};

export type { BlockLoadDetails, PlaceDetails };
export { BlockLoadCode, loadBlocks, PlaceCode };
