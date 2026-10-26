import type { Axis } from '#/kernel/constants';
import { AXES, SEAM_FOLDER } from '#/kernel/constants';

import { MAX_WITHS, PRESET_FILE_EXTENSION } from '../constants';

/**
 * Where a preset file lies under `presets/`: `<reader>/<axis>.yaml`, or below its axis's folder
 * `with/<block>.yaml` and `with/<block>/with/<partner>.yaml`. The ids are as the path spells them,
 * which the checks hold against the blocks.
 */
interface PresetFilePath {
  readonly axis: Axis;
  readonly reader: string;
  /** the blocks the path names after its reader, outermost first */
  readonly withs: readonly string[];
}

enum PathKind {
  PresetFile = 'preset-file',
  /** a file of a reader's folder that is no axis's: the data its entries name, such as plugins */
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

const SEPARATOR = '/';

const axisOf = (name: string): Axis | undefined => AXES.find((axis) => axis === name);

const dataPath: PathRead = {
  kind: PathKind.Data,
};

const misplacedPath: PathRead = {
  kind: PathKind.Misplaced,
};

const stemOf = (name: string): string => name.slice(0, -PRESET_FILE_EXTENSION.length);

// with/<block>, repeated, the last ending in the extension.
const withsOf = (segments: readonly string[]): readonly string[] | undefined => {
  const withs: string[] = [];

  for (let at = 0; at < segments.length; at += 2) {
    // the last segment ends in the extension, so a with/ folder is always followed by its block
    const block = String(segments[at + 1]);

    if (segments[at] !== SEAM_FOLDER) {
      return undefined;
    }

    withs.push(at + 2 === segments.length ? stemOf(block) : block);
  }

  return withs.length > MAX_WITHS ? undefined : withs;
};

/** A file of no YAML is data. */
const readOf = (path: string): PathRead => {
  // Stryker disable next-line StringLiteral: neither default is ever read as a reader or an axis
  const [reader = '', head = '', ...rest] = path.split(SEPARATOR);

  if (!path.endsWith(PRESET_FILE_EXTENSION) || (rest.length > 0 && axisOf(head) === undefined)) {
    return dataPath;
  }

  const axis = axisOf(rest.length === 0 ? stemOf(head) : head);
  const withs = withsOf(rest);

  return axis === undefined || withs === undefined
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
      SEAM_FOLDER,
      block,
    ]),
  ].join(SEPARATOR) + PRESET_FILE_EXTENSION;

const PresetFilePath = {
  readOf,
  textOf,
} as const;

export type { PathRead };
export { PathKind, PresetFilePath };
