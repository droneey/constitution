import type { Axis } from '#/kernel/constants';
import { AXES, AXIS_FOLDER_NAME, PATH_SEPARATOR, SEAM_FOLDER_NAME } from '#/kernel/constants';
import { BlockId } from '#/kernel/value-objects';

import { MAX_WITHS, PRESET_FILE_EXTENSION } from '../constants';

interface PresetFilePath {
  readonly axis: Axis;
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

const axisOf = (name: string | undefined): Axis | undefined =>
  AXES.find((axis) => AXIS_FOLDER_NAME[axis] === name);

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

const withsOf = (segments: readonly string[]): readonly BlockId[] | undefined => {
  const partners = partnerSegmentsOf(segments);

  if (partners === undefined || partners.length > MAX_WITHS) {
    return undefined;
  }

  const withs = partners.map((partner) => partner.join(PATH_SEPARATOR));

  return withs.every((block) => BlockId.is(block)) ? withs : undefined;
};

const presetFileOf = (input: { axis: Axis; reader: string; rest: readonly string[] }): PathRead => {
  const withs = withsOf(input.rest);

  return withs === undefined || !BlockId.is(input.reader)
    ? misplacedPath
    : {
        presetFile: {
          axis: input.axis,
          reader: input.reader,
          withs,
        },
        kind: PathKind.PresetFile,
      };
};

const FILE_IN_READER_FOLDER = 2;

const readOf = (pathInPresets: string): PathRead => {
  if (!pathInPresets.endsWith(PRESET_FILE_EXTENSION)) {
    return dataPath;
  }

  const segments = pathInPresets.slice(0, -PRESET_FILE_EXTENSION.length).split(PATH_SEPARATOR);
  const axisAt = segments.findIndex((name) => axisOf(name) !== undefined);
  const axis = axisOf(segments[axisAt]);

  if (axis === undefined) {
    return segments.length > FILE_IN_READER_FOLDER ? dataPath : misplacedPath;
  }

  return presetFileOf({
    axis,
    reader: segments.slice(0, axisAt).join(PATH_SEPARATOR),
    rest: segments.slice(axisAt + 1),
  });
};

const textOf = (presetFile: PresetFilePath): string =>
  [
    presetFile.reader,
    AXIS_FOLDER_NAME[presetFile.axis],
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
