import type { Axis } from '../constants';
import { AXES, BLOCKS_FOLDER, LAYER_FOLDER, LAYERS, Layer } from '../constants';
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

type BlockFilePlace = {
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

interface LayerFolder {
  readonly layer: Layer;
  readonly prefix: string;
}

const SEPARATOR = '/';
const MARKDOWN_EXTENSION = '.md';
const MARKDOWN = /^[^.].*\.md$/;
const SEAM_FOLDER = 'with';
const layerFolders: readonly LayerFolder[] = LAYERS.map((layer) => ({
  layer,
  prefix: `${BLOCKS_FOLDER}/${LAYER_FOLDER[layer]}/`,
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
    if (!MARKDOWN.test(name)) {
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

  if (name !== SEAM_FOLDER || !MARKDOWN.test(seam)) {
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
}): BlockFilePlace =>
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

/** Where a path from a Constitution's or a pack's folder sits, or undefined outside every layer. */
const parse = (path: string): BlockFilePlace | undefined => {
  const folder = layerFolders.find((candidate) => path.startsWith(candidate.prefix));

  if (folder === undefined) {
    return undefined;
  }

  const rest = path.slice(folder.prefix.length);

  // core's folder is its one block's
  if (folder.layer === Layer.Core) {
    return inFolder({
      dir: folder.prefix.slice(0, -SEPARATOR.length),
      layer: folder.layer,
      name: coreBlockId,
      path,
      segments: rest.split(SEPARATOR),
    });
  }

  const slash = rest.indexOf(SEPARATOR);

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
        segments: rest.slice(slash + SEPARATOR.length).split(SEPARATOR),
      });
};

interface OrderKey {
  readonly axis: number;
  readonly folder: string;
  readonly layer: number;
  readonly role: number;
}

// Stryker disable ConditionalExpression: a passport and a stray file are never ordered by axis
const axisRankOf = (file: FileInBlock): number =>
  file.kind === BlockFileKind.Chapter || file.kind === BlockFileKind.Seam
    ? AXES.indexOf(file.axis)
    : 0;
// Stryker restore ConditionalExpression

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

  return typeof path === 'string' && isDeepEqual(parse(path), candidate);
};

// A place is all its path says of it, so one path is one place.
const equals = (left: BlockFilePlace, right: BlockFilePlace): boolean => left.path === right.path;

const BlockFilePlace = {
  compare,
  equals,
  is,
  parse,
} as const;

export type { BlockFolder, FileInBlock };
export { BlockFileKind, BlockFilePlace, Placement };
