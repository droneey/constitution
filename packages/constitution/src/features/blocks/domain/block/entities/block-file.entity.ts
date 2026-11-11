import type { Axis } from '#/kernel/constants';
import { BLOCKS_FOLDER_NAME, PATH_SEPARATOR } from '#/kernel/constants';
import type { ValueFindingDetails } from '#/kernel/entities';
import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import { firstBy } from '#/kernel/utils';
import type { BlockFolder, BlockId, FileInBlock } from '#/kernel/value-objects';
import { BlockFileKind, BlockFilePlace, Placement } from '#/kernel/value-objects';

import { TreePath } from '../../shared/value-objects';

enum BlockFileRole {
  Passport = 'passport',
  Chapter = 'chapter',
  Seam = 'seam',
}

interface BlockText {
  readonly axis: Axis;
  readonly body: string;
  readonly lines: number;
  readonly path: string;
}

type BlockFile = BlockText &
  (
    | {
        readonly role: BlockFileRole.Passport;
      }
    | {
        readonly role: BlockFileRole.Chapter;
      }
    | {
        readonly role: BlockFileRole.Seam;
        readonly seam: BlockId;
      }
  );

type PassportFile = Extract<
  BlockFile,
  {
    readonly role: BlockFileRole.Passport;
  }
>;

type PartFile = Exclude<BlockFile, PassportFile>;

const textOf = (input: BlockText): BlockText => ({
  axis: input.axis,
  body: input.body,
  lines: input.lines,
  path: input.path,
});

const chapter = (text: BlockText): PartFile => ({
  ...textOf(text),
  role: BlockFileRole.Chapter,
});

const passport = (text: BlockText): PassportFile => ({
  ...textOf(text),
  role: BlockFileRole.Passport,
});

const seam = (text: BlockText, other: BlockId): PartFile => ({
  ...textOf(text),
  role: BlockFileRole.Seam,
  seam: other,
});

const seamOf = (file: BlockFile): BlockId | undefined => {
  switch (file.role) {
    case BlockFileRole.Seam:
      return file.seam;
    case BlockFileRole.Passport:
    // Stryker disable next-line ConditionalExpression: the last case left without its return falls off the switch into the same absent value
    case BlockFileRole.Chapter:
      return;
  }
};

const withPath = <TFile extends BlockFile>(file: TFile, path: string): TFile => ({
  ...file,
  path,
});

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

type PlaceProblem = ProblemOf<PlaceDetails & Pick<ValueFindingDetails, ValueFailure.BlockId>>;

type PlaceFinding = FindingOf<PlaceDetails & Pick<ValueFindingDetails, ValueFailure.BlockId>>;

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

const blocksPrefix = `${BLOCKS_FOLDER_NAME}${PATH_SEPARATOR}`;

const unplacedKinds: ReadonlySet<BlockFileKind> = new Set<UnplacedFile>([
  BlockFileKind.NamedAfterBlock,
  BlockFileKind.SeamOfNoBlockId,
  BlockFileKind.Stray,
]);

const unplacedProblemOf = (file: UnplacedFile): PlaceProblem => {
  switch (file) {
    case BlockFileKind.NamedAfterBlock:
      return {
        code: PlaceCode.ChapterNamedAfterBlock,
        details: {},
      };
    case BlockFileKind.SeamOfNoBlockId:
      return {
        code: ValueFailure.BlockId,
        details: {
          site: ValueSite.SeamFile,
        },
      };
    case BlockFileKind.Stray:
      return {
        code: PlaceCode.StrayBlockFile,
        details: {},
      };
  }
};

const isPlaced = (file: FileInBlock): file is PlacedFile => !unplacedKinds.has(file.kind);

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

interface BlockFilesLocated {
  readonly findings: readonly PlaceFinding[];
  readonly groups: readonly BlockGroup[];
}

const locationOf = (paths: readonly TreePath[]): Location => {
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

const locate = (listed: readonly TreePath[]): BlockFilesLocated => {
  const location = locationOf(listed.filter((path) => path.startsWith(blocksPrefix)));

  return {
    findings: [
      ...location.outside.map(
        (path): PlaceFinding => ({
          code: PlaceCode.OutsideBlockFolder,
          details: {},
          path,
        }),
      ),
      ...location.misnamed.map(
        ({ dir, name }): PlaceFinding => ({
          code: ValueFailure.BlockId,
          details: {
            site: ValueSite.BlockFolder,
            written: name,
          },
          path: dir,
        }),
      ),
      ...location.unplaced.map(
        ({ file, path }): PlaceFinding => ({
          ...unplacedProblemOf(file),
          path,
        }),
      ),
    ],
    groups: groupByFolder(location.placed),
  };
};

const BlockFile = {
  chapter,
  locate,
  passport,
  seam,
  seamOf,
  withPath,
} as const;

export type { BlockGroup, PartFile, PassportFile, PlaceDetails, PlaceFinding };
export { BlockFile, BlockFileRole, PlaceCode };
