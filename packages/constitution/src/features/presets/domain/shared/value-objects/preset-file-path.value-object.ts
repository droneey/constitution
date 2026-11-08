import type { Axis } from '#/kernel/constants';
import {
  AXES,
  AXIS_FOLDER_NAME,
  BlockFormat,
  PATH_SEPARATOR,
  SEAM_FOLDER_NAME,
} from '#/kernel/constants';
import { BlockId } from '#/kernel/value-objects';

import { MAX_WITHS, PRESET_FILE_EXTENSION } from '../constants';

interface PresetFilePath {
  readonly axis: Axis;
  readonly format: BlockFormat;
  readonly reader: BlockId;
  readonly withs: readonly BlockId[];
}

enum PathKind {
  PresetFile = 'preset-file',
  Data = 'data',
  Misplaced = 'misplaced',
}

type PathRead =
  | {
      readonly presetFile: PresetFilePath;
      readonly kind: PathKind.PresetFile;
    }
  | {
      readonly kind: PathKind.Data | PathKind.Misplaced;
    };

interface Spelled {
  readonly format: BlockFormat;
  readonly segments: readonly string[];
}

const axisOf = (input: { format: BlockFormat; name: string }): Axis | undefined =>
  AXES.find((axis) => AXIS_FOLDER_NAME[input.format][axis] === input.name);

const dataPath: PathRead = {
  kind: PathKind.Data,
};

const misplacedPath: PathRead = {
  kind: PathKind.Misplaced,
};

const partnerSegmentsOf = (segments: readonly string[]): readonly string[][] | undefined => {
  const partners: string[][] = [];

  for (const segment of segments) {
    if (segment === SEAM_FOLDER_NAME) {
      partners.push([]);

      continue;
    }

    const partner = partners.at(-1);

    if (partner === undefined) {
      return undefined;
    }

    partner.push(segment);
  }

  return partners;
};

const withsOf = (input: Spelled): readonly BlockId[] | undefined => {
  const partners = partnerSegmentsOf(input.segments);

  if (
    partners === undefined ||
    partners.length > MAX_WITHS ||
    (input.format === BlockFormat.Legacy && partners.some((partner) => partner.length > 1))
  ) {
    return undefined;
  }

  const withs = partners.map((partner) => partner.join(PATH_SEPARATOR));

  return withs.every((block) => BlockId.is(block)) ? withs : undefined;
};

const presetFileOf = (input: {
  axis: Axis | undefined;
  format: BlockFormat;
  reader: string;
  rest: readonly string[];
}): PathRead => {
  const withs = withsOf({
    format: input.format,
    segments: input.rest,
  });

  return input.axis === undefined || withs === undefined || !BlockId.is(input.reader)
    ? misplacedPath
    : {
        presetFile: {
          axis: input.axis,
          format: input.format,
          reader: input.reader,
          withs,
        },
        kind: PathKind.PresetFile,
      };
};

const nestedReadOf = (segments: readonly string[], axisAt: number): PathRead =>
  presetFileOf({
    axis: axisOf({
      format: BlockFormat.Nested,
      name: String(segments[axisAt]),
    }),
    format: BlockFormat.Nested,
    reader: segments.slice(0, axisAt).join(PATH_SEPARATOR),
    rest: segments.slice(axisAt + 1),
  });

const legacyReadOf = (segments: readonly string[]): PathRead => {
  // Stryker disable next-line StringLiteral: neither default is ever read as a reader or an axis
  const [reader = '', head = '', ...rest] = segments;
  const axis = axisOf({
    format: BlockFormat.Legacy,
    name: head,
  });

  return rest.length > 0 && axis === undefined
    ? dataPath
    : presetFileOf({
        axis,
        format: BlockFormat.Legacy,
        reader,
        rest,
      });
};

const readOf = (pathInPresets: string): PathRead => {
  if (!pathInPresets.endsWith(PRESET_FILE_EXTENSION)) {
    return dataPath;
  }

  const segments = pathInPresets.slice(0, -PRESET_FILE_EXTENSION.length).split(PATH_SEPARATOR);
  const axisAt = segments.findIndex(
    (name) =>
      axisOf({
        format: BlockFormat.Nested,
        name,
      }) !== undefined,
  );

  return axisAt === -1 ? legacyReadOf(segments) : nestedReadOf(segments, axisAt);
};

const textOf = (presetFile: PresetFilePath): string =>
  [
    presetFile.reader,
    AXIS_FOLDER_NAME[presetFile.format][presetFile.axis],
    ...presetFile.withs.flatMap((block) => [
      SEAM_FOLDER_NAME,
      block,
    ]),
  ].join(PATH_SEPARATOR) + PRESET_FILE_EXTENSION;

const PresetFilePath = {
  readOf,
  textOf,
} as const;

export type { PathRead };
export { PathKind, PresetFilePath };
