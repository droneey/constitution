import type { Axis } from '#/kernel/constants';
import { AXES, PATH_SEPARATOR, SEAM_FOLDER_NAME } from '#/kernel/constants';
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

const axisOf = (axisName: string): Axis | undefined => AXES.find((axis) => axis === axisName);

const dataPath: PathRead = {
  kind: PathKind.Data,
};

const misplacedPath: PathRead = {
  kind: PathKind.Misplaced,
};

const stemOf = (fileName: string): string => fileName.slice(0, -PRESET_FILE_EXTENSION.length);

const withsOf = (segments: readonly string[]): readonly BlockId[] | undefined => {
  const withs: BlockId[] = [];

  for (const [index, segment] of segments.entries()) {
    if (index % 2 === 0) {
      if (segment !== SEAM_FOLDER_NAME) {
        return undefined;
      }

      continue;
    }

    const block = index === segments.length - 1 ? stemOf(segment) : segment;

    if (!BlockId.is(block)) {
      return undefined;
    }

    withs.push(block);
  }

  return withs.length > MAX_WITHS ? undefined : withs;
};

const readOf = (pathInPresets: string): PathRead => {
  // Stryker disable next-line StringLiteral: neither default is ever read as a reader or an axis
  const [reader = '', head = '', ...rest] = pathInPresets.split(PATH_SEPARATOR);

  if (
    !pathInPresets.endsWith(PRESET_FILE_EXTENSION) ||
    (rest.length > 0 && axisOf(head) === undefined)
  ) {
    return dataPath;
  }

  const axis = axisOf(rest.length === 0 ? stemOf(head) : head);
  const withs = withsOf(rest);

  return axis === undefined || withs === undefined || !BlockId.is(reader)
    ? misplacedPath
    : {
        presetFile: {
          axis,
          reader,
          withs,
        },
        kind: PathKind.PresetFile,
      };
};

const textOf = (presetFile: PresetFilePath): string =>
  [
    presetFile.reader,
    presetFile.axis,
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
