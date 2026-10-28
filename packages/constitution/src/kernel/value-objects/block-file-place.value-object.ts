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
  Loose = 'loose',
  MisnamedFolder = 'misnamed-folder',
}

enum BlockFileKind {
  Passport = 'passport',
  Chapter = 'chapter',
  Seam = 'seam',
  NamedAfterBlock = 'named-after-block',
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

const HIDDEN_NAME_PREFIX = '.';

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
  !name.startsWith(HIDDEN_NAME_PREFIX) && name.endsWith(MARKDOWN_EXTENSION);

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

const placeInBlockFolder = (input: {
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
    return placeInBlockFolder({
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
    : placeInBlockFolder({
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

const orderKeyOf = (place: BlockFilePlace): OrderKey => {
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

const compare = (left: BlockFilePlace, right: BlockFilePlace): number => {
  const leftKey = orderKeyOf(left);
  const rightKey = orderKeyOf(right);

  return (
    leftKey.layer - rightKey.layer ||
    compareText(leftKey.folder, rightKey.folder) ||
    leftKey.role - rightKey.role ||
    leftKey.axis - rightKey.axis ||
    compareText(left.path, right.path)
  );
};

const is = (candidate: unknown): candidate is BlockFilePlace => {
  const path = fieldsOf(candidate).get('path');

  return typeof path === 'string' && isDeepEqual(placeOf(path), candidate);
};

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

const pathOf = (input: PathInput): string => {
  const { file } = input;
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
