import { AXES, Axis, Layer } from '#/kernel/constants';

enum BlockPathFile {
  Passport = 'passport',
  Chapter = 'chapter',
  With = 'with',
  // <axis>/<id>.md: a chapter named after its block, which only the passport is.
  NamedAfterBlock = 'named-after-block',
  Stray = 'stray',
}

type UnplacedFile = BlockPathFile.NamedAfterBlock | BlockPathFile.Stray;

// An unplaced file sits in a block's folder but in no place of the block's form, so it has no axis.
type PathInBlock =
  | {
      axis: Axis;
      file: Exclude<BlockPathFile, UnplacedFile>;
      with: string | undefined;
    }
  | {
      file: UnplacedFile;
    };

type BlockPath = PathInBlock & {
  dir: string;
  id: string;
  layer: Layer;
};

type PlacedPath = Extract<
  BlockPath,
  {
    axis: Axis;
  }
>;

interface Folder {
  dir: string;
  id: string;
  layer: Layer;
  rest: readonly string[];
}

interface LayerFolder {
  layer: Layer;
  prefix: readonly string[];
}

const CORE_PREFIX: readonly string[] = [
  'blocks',
  'core',
];
const LAYER_FOLDERS: readonly LayerFolder[] = [
  {
    layer: Layer.Domain,
    prefix: [
      'blocks',
      'domains',
    ],
  },
  {
    layer: Layer.Platform,
    prefix: [
      'blocks',
      'contexts',
      'platforms',
    ],
  },
  {
    layer: Layer.Language,
    prefix: [
      'blocks',
      'contexts',
      'languages',
    ],
  },
  {
    layer: Layer.Implementation,
    prefix: [
      'blocks',
      'implementations',
    ],
  },
];
const MARKDOWN = /^[^.].*\.md$/;
const MARKDOWN_EXTENSION = '.md';
const SEAM_FOLDER = 'with';
// The depths of a block's files below its folder: <id>.md, <axis>/<file>.md and <axis>/with/<block>.md.
const PASSPORT_DEPTH = 1;
const CHAPTER_DEPTH = 2;
const SEAM_DEPTH = 3;
const STRAY: PathInBlock = {
  file: BlockPathFile.Stray,
};

const startsWith = (input: { prefix: readonly string[]; segments: readonly string[] }): boolean =>
  input.prefix.every((segment, index) => input.segments[index] === segment);

const coreFolder = (segments: readonly string[]): Folder | undefined => {
  const rest = segments.slice(CORE_PREFIX.length);

  return startsWith({
    prefix: CORE_PREFIX,
    segments,
  }) && rest.length > 0
    ? {
        dir: CORE_PREFIX.join('/'),
        id: 'core',
        layer: Layer.Core,
        rest,
      }
    : undefined;
};

const layerFolder = (segments: readonly string[]): Folder | undefined => {
  const match = LAYER_FOLDERS.find((folder) =>
    startsWith({
      prefix: folder.prefix,
      segments,
    }),
  );

  if (match === undefined) {
    return undefined;
  }

  // Stryker disable next-line StringLiteral: without an id, rest is empty too
  const [id = '', ...rest] = segments.slice(match.prefix.length);

  return rest.length === 0
    ? undefined
    : {
        dir: [
          ...match.prefix,
          id,
        ].join('/'),
        id,
        layer: match.layer,
        rest,
      };
};

const fileOf = (folder: Folder): PathInBlock => {
  // Stryker disable next-line StringLiteral: the depth check guards every read
  const [first = '', name = '', seam = ''] = folder.rest;
  const depth = folder.rest.length;
  const own = `${folder.id}${MARKDOWN_EXTENSION}`;

  if (depth === PASSPORT_DEPTH && first === own) {
    return {
      axis: Axis.Foundation,
      file: BlockPathFile.Passport,
      with: undefined,
    };
  }

  const axis = AXES.find((candidate) => candidate === first);

  if (axis !== undefined && depth === CHAPTER_DEPTH && MARKDOWN.test(name)) {
    return name === own
      ? {
          file: BlockPathFile.NamedAfterBlock,
        }
      : {
          axis,
          file: BlockPathFile.Chapter,
          with: undefined,
        };
  }

  return axis !== undefined && depth === SEAM_DEPTH && name === SEAM_FOLDER && MARKDOWN.test(seam)
    ? {
        axis,
        file: BlockPathFile.With,
        with: seam.slice(0, -MARKDOWN_EXTENSION.length),
      }
    : STRAY;
};

const classifyBlockPath = (path: string): BlockPath | undefined => {
  const segments = path.split('/');
  const folder = coreFolder(segments) ?? layerFolder(segments);

  if (folder === undefined) {
    return undefined;
  }

  return {
    dir: folder.dir,
    id: folder.id,
    layer: folder.layer,
    ...fileOf(folder),
  };
};

export type { PlacedPath, UnplacedFile };
export { BlockPathFile, classifyBlockPath };
