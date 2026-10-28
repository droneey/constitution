import type { Axis } from '../constants';
import {
  AXES,
  BLOCKS_FOLDER_NAME,
  LAYER_FOLDER_NAME,
  LAYERS,
  Layer,
  MARKDOWN_EXTENSION,
  PATH_SEPARATOR,
  SEAM_FOLDER_NAME,
} from '../constants';
import type { Brand } from '../types';
import { compareText, fieldsOf, isDeepEqual } from '../utils';
import { BlockId, coreBlockId } from './block-id.value-object';

enum Placement {
  InBlock = 'in-block',
  /** at the root of a layer's folder, in no block's folder */
  Loose = 'loose',
  /** in a block folder whose name is no block id */
  MisnamedFolder = 'misnamed-folder',
}

enum BlockFileKind {
  Passport = 'passport',
  Chapter = 'chapter',
  Seam = 'seam',
  /** <axis>/<id>.md: a chapter named after its block, which only the passport is */
  NamedAfterBlock = 'named-after-block',
  /** <axis>/with/<name>.md whose name is no block id */
  SeamOfNoBlockId = 'seam-of-no-block-id',
  Stray = 'stray',
}

interface BlockFolder {
  readonly dir: string;
  readonly id: BlockId;
  readonly layer: Layer;
}

type FileInBlock =
  | {
      readonly kind: BlockFileKind.Passport;
    }
  | {
      readonly axis: Axis;
      readonly kind: BlockFileKind.Chapter;
      readonly name: string;
    }
  | {
      readonly axis: Axis;
      readonly kind: BlockFileKind.Seam;
      readonly other: BlockId;
    }
  | {
      readonly kind:
        | BlockFileKind.NamedAfterBlock
        | BlockFileKind.SeamOfNoBlockId
        | BlockFileKind.Stray;
    };

/** A file a block's folder holds by its form: its passport, a chapter or a seam. */
type BlockPart = Extract<
  FileInBlock,
  {
    readonly kind: BlockFileKind.Chapter | BlockFileKind.Passport | BlockFileKind.Seam;
  }
>;

type PlaceFields = {
  readonly path: string;
} & (
  | {
      readonly file: FileInBlock;
      readonly folder: BlockFolder;
      readonly placement: Placement.InBlock;
    }
  | {
      readonly layer: Layer;
      readonly placement: Placement.Loose;
    }
  | {
      readonly dir: string;
      readonly layer: Layer;
      readonly name: string;
      readonly placement: Placement.MisnamedFolder;
    }
);

type BlockFilePlace = Brand<PlaceFields, 'BlockFilePlace'>;

interface LayerFolder {
  readonly layer: Layer;
  readonly prefix: string;
}

const HIDDEN = '.';

const prefixOf = (layer: Layer): string =>
  `${BLOCKS_FOLDER_NAME}${PATH_SEPARATOR}${LAYER_FOLDER_NAME[layer]}${PATH_SEPARATOR}`;

const layerFolders: readonly LayerFolder[] = LAYERS.map((layer) => ({
  layer,
  prefix: prefixOf(layer),
}));

const ROLE_RANK = {
  [BlockFileKind.Passport]: 0,
  [BlockFileKind.Chapter]: 1,
  [BlockFileKind.Seam]: 2,
  [BlockFileKind.NamedAfterBlock]: 3,
  [BlockFileKind.SeamOfNoBlockId]: 3,
  [BlockFileKind.Stray]: 3,
} as const satisfies Readonly<Record<BlockFileKind, number>>;

const STRAY = {
  kind: BlockFileKind.Stray,
} as const satisfies FileInBlock;

const isMarkdown = (name: string): boolean =>
  !name.startsWith(HIDDEN) && name.endsWith(MARKDOWN_EXTENSION);

// <id>.md, <axis>/<name>.md or <axis>/with/<block>.md below the block's folder.
const fileOf = (input: { id: BlockId; segments: readonly string[] }): FileInBlock => {
  const [first, name, seam, ...deeper] = input.segments;
  const own = `${input.id}${MARKDOWN_EXTENSION}`;
  const axis = AXES.find((candidate) => candidate === first);

  if (name === undefined) {
    return first === own
      ? {
          kind: BlockFileKind.Passport,
        }
      : STRAY;
  }

  if (axis === undefined || deeper.length > 0) {
    return STRAY;
  }

  if (seam === undefined) {
    if (!isMarkdown(name)) {
      return STRAY;
    }

    return name === own
      ? {
          kind: BlockFileKind.NamedAfterBlock,
        }
      : {
          axis,
          kind: BlockFileKind.Chapter,
          name: name.slice(0, -MARKDOWN_EXTENSION.length),
        };
  }

  if (name !== SEAM_FOLDER_NAME || !isMarkdown(seam)) {
    return STRAY;
  }

  const other = seam.slice(0, -MARKDOWN_EXTENSION.length);

  return BlockId.is(other)
    ? {
        axis,
        kind: BlockFileKind.Seam,
        other,
      }
    : {
        kind: BlockFileKind.SeamOfNoBlockId,
      };
};

const inFolder = (input: {
  dir: string;
  layer: Layer;
  name: string;
  path: string;
  segments: readonly string[];
}): PlaceFields =>
  BlockId.is(input.name)
    ? {
        file: fileOf({
          id: input.name,
          segments: input.segments,
        }),
        folder: {
          dir: input.dir,
          id: input.name,
          layer: input.layer,
        },
        path: input.path,
        placement: Placement.InBlock,
      }
    : {
        dir: input.dir,
        layer: input.layer,
        name: input.name,
        path: input.path,
        placement: Placement.MisnamedFolder,
      };

const placeOf = (path: string): PlaceFields | undefined => {
  const folder = layerFolders.find((candidate) => path.startsWith(candidate.prefix));

  if (folder === undefined) {
    return undefined;
  }

  const rest = path.slice(folder.prefix.length);

  if (folder.layer === Layer.Core) {
    return inFolder({
      dir: folder.prefix.slice(0, -PATH_SEPARATOR.length),
      layer: folder.layer,
      name: coreBlockId,
      path,
      segments: rest.split(PATH_SEPARATOR),
    });
  }

  const slash = rest.indexOf(PATH_SEPARATOR);

  return slash === -1
    ? {
        layer: folder.layer,
        path,
        placement: Placement.Loose,
      }
    : inFolder({
        dir: `${folder.prefix}${rest.slice(0, slash)}`,
        layer: folder.layer,
        name: rest.slice(0, slash),
        path,
        segments: rest.slice(slash + PATH_SEPARATOR.length).split(PATH_SEPARATOR),
      });
};

interface OrderKey {
  readonly axis: number;
  readonly folder: string;
  readonly layer: number;
  readonly role: number;
}

const axisRankOf = (file: FileInBlock): number =>
  // Stryker disable next-line ConditionalExpression: a passport and a stray file are never ordered by axis
  file.kind === BlockFileKind.Chapter || file.kind === BlockFileKind.Seam
    ? AXES.indexOf(file.axis)
    : 0;

// A layer's folder holds one block's folder of a name. Only a chapter's and a seam's axis orders: a
// block has one passport, and a stray file sorts by its path.
const keyOf = (place: BlockFilePlace): OrderKey => {
  if (place.placement === Placement.InBlock) {
    const { file } = place;

    return {
      axis: axisRankOf(file),
      folder: place.folder.id,
      layer: LAYERS.indexOf(place.folder.layer),
      role: ROLE_RANK[file.kind],
    };
  }

  return {
    axis: 0,
    folder: place.placement === Placement.MisnamedFolder ? place.name : '',
    layer: LAYERS.indexOf(place.layer),
    role: ROLE_RANK[BlockFileKind.Stray],
  };
};

/**
 * The order the blocks are read in: by layer, then folder, then the passport, the chapters, the seams
 * and any other file, each by axis and then by path.
 */
const compare = (left: BlockFilePlace, right: BlockFilePlace): number => {
  const leftKey = keyOf(left);
  const rightKey = keyOf(right);

  return (
    leftKey.layer - rightKey.layer ||
    compareText(leftKey.folder, rightKey.folder) ||
    leftKey.role - rightKey.role ||
    leftKey.axis - rightKey.axis ||
    compareText(left.path, right.path)
  );
};

/** Whether a value is the place its path parses to. */
const is = (candidate: unknown): candidate is BlockFilePlace => {
  const path = fieldsOf(candidate).get('path');

  return typeof path === 'string' && isDeepEqual(placeOf(path), candidate);
};

/** Where a path from a Constitution's or a pack's folder sits, or undefined outside every layer. */
const parse = (path: string): BlockFilePlace | undefined => {
  const place = placeOf(path);

  // Stryker disable next-line ConditionalExpression: a place made from a path is always the place it parses to
  return is(place) ? place : undefined;
};

interface PathInput {
  readonly block: BlockId;
  readonly file: BlockPart;
  readonly layer: Layer;
}

/** The path from a Constitution's or a pack's folder of a block's part, as parse reads it back. */
const pathOf = (input: PathInput): string => {
  const { file } = input;
  // core's folder is its one block's
  const folder =
    input.layer === Layer.Core
      ? prefixOf(input.layer)
      : `${prefixOf(input.layer)}${input.block}${PATH_SEPARATOR}`;

  switch (file.kind) {
    case BlockFileKind.Passport:
      return `${folder}${input.block}${MARKDOWN_EXTENSION}`;
    case BlockFileKind.Chapter:
      return `${folder}${file.axis}${PATH_SEPARATOR}${file.name}${MARKDOWN_EXTENSION}`;
    case BlockFileKind.Seam:
      return `${folder}${file.axis}${PATH_SEPARATOR}${SEAM_FOLDER_NAME}${PATH_SEPARATOR}${file.other}${MARKDOWN_EXTENSION}`;
    // Stryker disable next-line ConditionalExpression: no part reaches the default, which only the compiler reads
    default:
      return file satisfies never;
  }
};

// A place is all its path says of it, so one path is one place.
const equals = (left: BlockFilePlace, right: BlockFilePlace): boolean => left.path === right.path;

const BlockFilePlace = {
  compare,
  equals,
  is,
  parse,
  pathOf,
} as const;

export type { BlockFolder, BlockPart, FileInBlock };
export { BlockFileKind, BlockFilePlace, Placement };
