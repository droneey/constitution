import { BLOCKS_FOLDER } from '#/kernel/constants';
import type { ValueFindingDetails } from '#/kernel/entities';
import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import type { FileInBlock } from '#/kernel/value-objects';
import { BlockFileKind, BlockFilePlace, Placement } from '#/kernel/value-objects';

import type { FileTree, FrontMatterParser } from '../../../../../../../contracts';
import type { Block } from '../../../../../../../entities';
import type { BlockLoadFinding, Located, PlacedFile, UnplacedFile } from './load-block.utils';
import { groupByFolder, loadBlock } from './load-block.utils';

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

type BlocksLoadedFinding =
  | FindingOf<PlaceDetails & Pick<ValueFindingDetails, ValueFailure.BlockId>>
  | BlockLoadFinding;

const blocksPrefix = `${BLOCKS_FOLDER}/`;

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

interface Unplaced {
  readonly file: UnplacedFile;
  readonly path: string;
}

// A block folder whose name is no block id: no block loads from it.
interface Misnamed {
  readonly dir: string;
  readonly name: string;
}

interface Location {
  readonly misnamed: readonly Misnamed[];
  /** under the blocks folder, in no block's folder */
  readonly outside: readonly string[];
  readonly placed: readonly Located[];
  readonly unplaced: readonly Unplaced[];
}

const locate = (paths: readonly string[]): Location => {
  const misnamed = new Map<string, Misnamed>();
  const outside: string[] = [];
  const placed: Located[] = [];
  const unplaced: Unplaced[] = [];

  for (const path of paths) {
    const place = BlockFilePlace.parse(path);

    if (place === undefined || place.placement === Placement.Loose) {
      outside.push(path);

      continue;
    }

    if (place.placement === Placement.MisnamedFolder) {
      misnamed.set(place.dir, {
        dir: place.dir,
        name: place.name,
      });

      continue;
    }

    const { file } = place;

    if (isPlaced(file)) {
      placed.push({
        file,
        folder: place.folder,
        place,
      });
    } else {
      unplaced.push({
        file: file.kind,
        path,
      });
    }
  }

  return {
    misnamed: [
      ...misnamed.values(),
    ],
    outside,
    placed,
    unplaced,
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
      outcome.block === undefined
        ? []
        : [
            outcome.block,
          ],
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

export type { PlaceDetails };
export { loadBlocks, PlaceCode };
