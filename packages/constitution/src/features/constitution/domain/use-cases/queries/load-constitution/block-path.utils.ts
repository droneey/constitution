import { Axis, Layer, OPTIONAL_AXES } from '#/kernel/constants';

enum BlockPathFile {
  Main = 'main',
  Chapter = 'chapter',
  With = 'with',
  Stray = 'stray',
}

interface PathInBlock {
  axis: Axis;
  file: BlockPathFile;
  name: string;
  with: string | undefined;
}

interface BlockPath extends PathInBlock {
  dir: string;
  id: string;
  layer: Layer;
}

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
const SEAM_DEPTH = 2;

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

// The base sits at the block's root; an optional axis keeps a folder of its own.
const fileOf = (folder: Folder): PathInBlock => {
  // Stryker disable next-line StringLiteral: an empty rest names no folder
  const [first = ''] = folder.rest;
  const optional = OPTIONAL_AXES.find((candidate) => candidate === first);
  const inAxis = optional === undefined ? folder.rest : folder.rest.slice(1);
  const prefix = optional === undefined ? '' : `${optional}/`;
  const axis = optional ?? Axis.Foundation;
  // Stryker disable next-line StringLiteral: a length check guards every read
  const [name = '', seam = ''] = inAxis;

  if (inAxis.length === 1 && MARKDOWN.test(name)) {
    return {
      axis,
      file:
        optional === undefined && name === `${folder.id}${MARKDOWN_EXTENSION}`
          ? BlockPathFile.Main
          : BlockPathFile.Chapter,
      name: `${prefix}${name}`,
      with: undefined,
    };
  }

  if (inAxis.length === SEAM_DEPTH && name === SEAM_FOLDER && MARKDOWN.test(seam)) {
    return {
      axis,
      file: BlockPathFile.With,
      name: `${prefix}${name}/${seam}`,
      with: seam.slice(0, -MARKDOWN_EXTENSION.length),
    };
  }

  return {
    axis,
    file: BlockPathFile.Stray,
    // Stryker disable next-line StringLiteral: nothing reads the name of a stray file
    name: folder.rest.join('/'),
    with: undefined,
  };
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

export type { BlockPath };
export { BlockPathFile, classifyBlockPath };
