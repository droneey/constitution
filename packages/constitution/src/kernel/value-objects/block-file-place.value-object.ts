import type { Axis } from '../constants';
import {
  AXES,
  AXIS_FOLDER_NAME,
  BLOCKS_FOLDER_NAME,
  BlockFormat,
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
const AXIS_MARK = '@';
const blocksPrefix = `${BLOCKS_FOLDER_NAME}${PATH_SEPARATOR}`;

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

const nestedAxisFolders: ReadonlySet<string> = new Set(
  Object.values(AXIS_FOLDER_NAME[BlockFormat.Nested]),
);

const axisNamed = (format: BlockFormat, name: string | undefined): Axis | undefined =>
  AXES.find((axis) => AXIS_FOLDER_NAME[format][axis] === name);

const seamFileOf = (input: {
  axis: Axis;
  format: BlockFormat;
  segments: readonly string[];
}): FileInBlock => {
  const written = input.segments.join(PATH_SEPARATOR);

  if (!isMarkdown(written) || (input.format === BlockFormat.Legacy && input.segments.length > 1)) {
    return STRAY;
  }

  const other = written.slice(0, -MARKDOWN_EXTENSION.length);

  return BlockId.is(other)
    ? {
        axis: input.axis,
        kind: BlockFileKind.Seam,
        other,
      }
    : {
        kind: BlockFileKind.SeamOfNoBlockId,
      };
};

const fileOf = (input: {
  format: BlockFormat;
  id: BlockId;
  segments: readonly string[];
}): FileInBlock => {
  const [first, name, ...seam] = input.segments;
  const own = `${BlockId.lastSegmentOf(input.id)}${MARKDOWN_EXTENSION}`;
  const axis = axisNamed(input.format, first);

  if (name === undefined) {
    return first === own
      ? {
          kind: BlockFileKind.Passport,
        }
      : STRAY;
  }

  if (axis === undefined) {
    return STRAY;
  }

  if (seam.length === 0) {
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

  return name === SEAM_FOLDER_NAME
    ? seamFileOf({
        axis,
        format: input.format,
        segments: seam,
      })
    : STRAY;
};

const isFolderBelowBlock = (folder: string, index: number): boolean =>
  index > 0 && (folder.startsWith(AXIS_MARK) || folder.startsWith(HIDDEN_NAME_PREFIX));

const blockFoldersOf = (format: BlockFormat, segments: readonly string[]): readonly string[] => {
  const folders = segments.slice(0, -1);
  const below = folders.findIndex(isFolderBelowBlock);

  if (format === BlockFormat.Legacy) {
    return folders.slice(0, 1);
  }

  return below === -1 ? folders : folders.slice(0, below);
};

const isFolderName = (format: BlockFormat, name: string): boolean =>
  format === BlockFormat.Legacy ? BlockId.is(name) : BlockId.isSegment(name);

const placeInLayer = (input: {
  format: BlockFormat;
  layer: Layer;
  path: string;
  prefix: string;
  segments: readonly string[];
}): PlaceFields => {
  const names = blockFoldersOf(input.format, input.segments);
  const misnamed = names.find((name) => !isFolderName(input.format, name));

  if (misnamed !== undefined) {
    return {
      dir: `${input.prefix}${names.slice(0, names.indexOf(misnamed) + 1).join(PATH_SEPARATOR)}`,
      layer: input.layer,
      name: misnamed,
      path: input.path,
      placement: Placement.MisnamedFolder,
    };
  }

  const id = BlockId.create(names.join(PATH_SEPARATOR));

  return {
    file: fileOf({
      format: input.format,
      id,
      segments: input.segments.slice(names.length),
    }),
    folder: {
      dir: `${input.prefix}${id}`,
      id,
      layer: input.layer,
    },
    path: input.path,
    placement: Placement.InBlock,
  };
};

const placeOf = (path: string, format: BlockFormat): PlaceFields | undefined => {
  const folder = layerFolders.find((candidate) => path.startsWith(candidate.prefix));

  if (folder === undefined) {
    return undefined;
  }

  const segments = path.slice(folder.prefix.length).split(PATH_SEPARATOR);

  if (folder.layer === Layer.Core) {
    return {
      file: fileOf({
        format,
        id: coreBlockId,
        segments,
      }),
      folder: {
        dir: folder.prefix.slice(0, -PATH_SEPARATOR.length),
        id: coreBlockId,
        layer: folder.layer,
      },
      path,
      placement: Placement.InBlock,
    };
  }

  return segments.length === 1
    ? {
        layer: folder.layer,
        path,
        placement: Placement.Loose,
      }
    : placeInLayer({
        format,
        layer: folder.layer,
        path,
        prefix: folder.prefix,
        segments,
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

const formats: readonly BlockFormat[] = Object.values(BlockFormat);

const is = (candidate: unknown): candidate is BlockFilePlace => {
  const path = fieldsOf(candidate).get('path');

  return (
    typeof path === 'string' &&
    formats.some((format) => isDeepEqual(placeOf(path, format), candidate))
  );
};

const parse = (path: string, format: BlockFormat): BlockFilePlace | undefined => {
  const place = placeOf(path, format);

  // Stryker disable next-line ConditionalExpression: a place made from a path is always the place it parses to
  return is(place) ? place : undefined;
};

interface PathInput {
  readonly block: BlockId;
  readonly file: BlockPart;
  readonly format: BlockFormat;
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
      return `${folder}${BlockId.lastSegmentOf(input.block)}${MARKDOWN_EXTENSION}`;
    case BlockFileKind.Chapter:
      return `${folder}${AXIS_FOLDER_NAME[input.format][file.axis]}${PATH_SEPARATOR}${file.name}${MARKDOWN_EXTENSION}`;
    case BlockFileKind.Seam:
      return `${folder}${AXIS_FOLDER_NAME[input.format][file.axis]}${PATH_SEPARATOR}${SEAM_FOLDER_NAME}${PATH_SEPARATOR}${file.other}${MARKDOWN_EXTENSION}`;
  }
};

const isUnderBlocks = (path: string): boolean => path.startsWith(blocksPrefix);

const formatOf = (paths: readonly string[]): BlockFormat =>
  paths.some(
    (path) =>
      isUnderBlocks(path) &&
      path.split(PATH_SEPARATOR).some((segment) => nestedAxisFolders.has(segment)),
  )
    ? BlockFormat.Nested
    : BlockFormat.Legacy;

const equals = (left: BlockFilePlace, right: BlockFilePlace): boolean => left.path === right.path;

const BlockFilePlace = {
  compare,
  equals,
  formatOf,
  is,
  parse,
  pathOf,
} as const;

export type { BlockFolder, BlockPart, FileInBlock };
export { BlockFileKind, BlockFilePlace, Placement };
