import type { Layer } from '#/kernel';

type BlockPathFile = 'main' | 'chapter' | 'with' | 'stray';

interface BlockPath {
  dir: string;
  file: BlockPathFile;
  id: string;
  layer: Layer;
  name: string;
  with: string | undefined;
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
    layer: 'domain',
    prefix: [
      'blocks',
      'domains',
    ],
  },
  {
    layer: 'platform',
    prefix: [
      'blocks',
      'contexts',
      'platforms',
    ],
  },
  {
    layer: 'language',
    prefix: [
      'blocks',
      'contexts',
      'languages',
    ],
  },
  {
    layer: 'implementation',
    prefix: [
      'blocks',
      'implementations',
    ],
  },
];
const MARKDOWN = /^[^.].*\.md$/;
const MARKDOWN_EXTENSION = '.md';
const SEAM_FOLDER = 'with';

const startsWith = (input: {
  prefix: readonly string[];
  segments: readonly string[];
}): boolean =>
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
        layer: 'core',
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

const fileOf = (folder: Folder): Pick<BlockPath, 'file' | 'name' | 'with'> => {
  // Stryker disable next-line StringLiteral: a length check guards every read
  const [first = '', second = ''] = folder.rest;

  if (folder.rest.length === 1 && MARKDOWN.test(first)) {
    return {
      file: first === `${folder.id}${MARKDOWN_EXTENSION}` ? 'main' : 'chapter',
      name: first,
      with: undefined,
    };
  }

  if (
    folder.rest.length === 2 &&
    first === SEAM_FOLDER &&
    MARKDOWN.test(second)
  ) {
    return {
      file: 'with',
      name: second,
      with: second.slice(0, -MARKDOWN_EXTENSION.length),
    };
  }

  return {
    file: 'stray',
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

export type { BlockPath, BlockPathFile };
export { classifyBlockPath };
