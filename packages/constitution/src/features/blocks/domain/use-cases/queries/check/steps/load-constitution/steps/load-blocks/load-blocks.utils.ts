import { BLOCKS_FOLDER } from '#/kernel/constants';
import { ValueFailure } from '#/kernel/errors';
import type { Finding, Problem } from '#/kernel/types';
import { BlockFileKind, BlockFilePlace, Placement } from '#/kernel/value-objects';

import type { FileTree, FrontMatterParser } from '../../../../../../../contracts';
import type { Block } from '../../../../../../../entities';
import type { Located } from './load-block.utils';
import { groupByFolder, loadBlock } from './load-block.utils';

enum PlaceCode {
  OutsideBlockFolder = 'outside-block-folder',
  StrayBlockFile = 'stray-block-file',
  ChapterNamedAfterBlock = 'chapter-named-after-its-block',
}

const blocksPrefix = `${BLOCKS_FOLDER}/`;
const OUTSIDE =
  'is not inside a block folder; a block is blocks/core, or a folder <id>/ in domains, contexts/platforms, contexts/languages or implementations';
const STRAY =
  'is not a block file; a block holds at its root its passport <id>.md, and in foundation/, architecture/ and workflow/ its chapters <name>.md and its seams with/<block>.md';
const NAMED_AFTER_BLOCK =
  "is named after its block; an axis holds named chapters and seams, and the block's id names only its passport <id>.md";
const SEAM_OF_NO_BLOCK_ID =
  "is a seam whose name is not a kebab-case block id; a seam is with/<block>.md, named after the other block's id";
type UnplacedFile =
  | BlockFileKind.NamedAfterBlock
  | BlockFileKind.SeamOfNoBlockId
  | BlockFileKind.Stray;

const UNPLACED = {
  [BlockFileKind.NamedAfterBlock]: {
    code: PlaceCode.ChapterNamedAfterBlock,
    message: NAMED_AFTER_BLOCK,
  },
  [BlockFileKind.SeamOfNoBlockId]: {
    code: ValueFailure.BlockId,
    message: SEAM_OF_NO_BLOCK_ID,
  },
  [BlockFileKind.Stray]: {
    code: PlaceCode.StrayBlockFile,
    message: STRAY,
  },
} as const satisfies Readonly<Record<UnplacedFile, Problem>>;

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

    if (
      file.kind === BlockFileKind.Passport ||
      file.kind === BlockFileKind.Chapter ||
      file.kind === BlockFileKind.Seam
    ) {
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
  readonly findings: readonly Finding[];
}

const loadBlocks = (input: { parser: FrontMatterParser; tree: FileTree }): BlocksLoaded => {
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
      ...located.outside.map((path) => ({
        code: PlaceCode.OutsideBlockFolder,
        message: OUTSIDE,
        path,
      })),
      ...located.misnamed.map(({ dir, name }) => ({
        code: ValueFailure.BlockId,
        message: `is a block folder named "${name}", which is not a kebab-case block id`,
        path: dir,
      })),
      ...located.unplaced.map(({ file, path }) => ({
        ...UNPLACED[file],
        path,
      })),
      ...loaded.flatMap((outcome) => outcome.findings),
    ],
  };
};

export type { BlocksLoaded };
export { loadBlocks };
