import type { Axis } from '../constants';
import { AXES, PRESETS_FOLDER } from '../constants';
import { fieldsOf, isDeepEqual, isPathSegment } from '../utils';
import { PartAddress } from './part-address.value-object';

enum PresetFileKind {
  Bindings = 'bindings',
  Part = 'part',
  Plugin = 'plugin',
}

/** A file of a tool's preset on an axis: presets/<scope>/<tool>/<axis>/. */
interface PresetFolder {
  readonly axis: Axis;
  readonly scope: string;
  readonly tool: string;
}

type PresetPartPath =
  | (PresetFolder & {
      readonly kind: PresetFileKind.Bindings;
    })
  | (PartAddress & {
      readonly kind: PresetFileKind.Part;
    })
  | (PresetFolder & {
      readonly kind: PresetFileKind.Plugin;
      readonly rule: string;
    });

type FolderFields = Readonly<Record<keyof PresetFolder, string | undefined>>;

const BINDINGS = 'bindings.yaml';
const PART_FILE = /^([^./]+)\.[^/]+$/;
const PLUGIN_FILE = /^plugins\/([^/.]+)\.grit$/;
const NAME_END = '.';
const SEPARATOR = '/';

/** A part's name is its file's up to the first dot: core.jsonc and core.d.ts name core. */
const partNameOf = (file: string): string => file.split(NAME_END, 1).join(NAME_END);

// The fields of bindings.yaml, <part>.<extension> or plugins/<rule>.grit below the folder of a tool's
// axis; parse keeps them only where they make a file of the preset.
const fieldsOfFile = (input: {
  file: string;
  folder: FolderFields;
}): FolderFields &
  (
    | {
        readonly kind: PresetFileKind.Bindings | PresetFileKind.Part;
        readonly name?: string;
      }
    | {
        readonly kind: PresetFileKind.Plugin;
        readonly rule: string | undefined;
      }
  ) => {
  const { file, folder } = input;
  const name = PART_FILE.exec(file)?.[1];

  if (file === BINDINGS) {
    return {
      ...folder,
      kind: PresetFileKind.Bindings,
    };
  }

  if (name !== undefined) {
    return {
      ...folder,
      kind: PresetFileKind.Part,
      name,
    };
  }

  return {
    ...folder,
    kind: PresetFileKind.Plugin,
    rule: PLUGIN_FILE.exec(file)?.[1],
  };
};

const isFolder = (fields: ReadonlyMap<string, unknown>): boolean =>
  AXES.some((axis) => axis === fields.get('axis')) &&
  isPathSegment(fields.get('scope')) &&
  isPathSegment(fields.get('tool'));

/**
 * Whether a value is a file of a tool's preset: the bindings of an axis, a part, or a plugin whose
 * rule is one path segment without a dot.
 */
const is = (candidate: unknown): candidate is PresetPartPath => {
  const fields = fieldsOf(candidate);
  const kind = fields.get('kind');
  const rule = fields.get('rule');

  return (
    (kind === PresetFileKind.Bindings && isFolder(fields)) ||
    (kind === PresetFileKind.Part && PartAddress.is(candidate)) ||
    (kind === PresetFileKind.Plugin &&
      isFolder(fields) &&
      isPathSegment(rule) &&
      !rule.includes(NAME_END))
  );
};

/** The file a path under the presets folder is, or undefined when it is none of a tool's on an axis. */
const parse = (path: string): PresetPartPath | undefined => {
  const [root, scope, tool, axis, ...file] = path.split(SEPARATOR);

  if (root !== PRESETS_FOLDER) {
    return undefined;
  }

  const preset = fieldsOfFile({
    file: file.join(SEPARATOR),
    folder: {
      axis,
      scope,
      tool,
    },
  });

  return is(preset) ? preset : undefined;
};

const PresetPartPath = {
  equals: (left: PresetPartPath, right: PresetPartPath): boolean => isDeepEqual(left, right),
  is,
  parse,
  partNameOf,
} as const;

export type { PresetFolder };
export { PresetFileKind, PresetPartPath };
