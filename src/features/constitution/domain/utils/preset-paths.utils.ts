import { Axis, OPTIONAL_AXES } from '#/kernel/constants';

enum PresetFileKind {
  Bindings = 'bindings',
  Part = 'part',
  Plugin = 'plugin',
}

type PresetPath =
  | {
      axis: Axis;
      kind: PresetFileKind.Bindings;
      scope: string;
      tool: string;
    }
  | {
      axis: Axis;
      kind: PresetFileKind.Part | PresetFileKind.Plugin;
      name: string;
      scope: string;
      tool: string;
    };

// presets/<scope>/<tool>/, then architecture/ or workflow/ for an optional
// axis, then bindings.yaml, <part>.<extension> or plugins/<rule>.grit
const PRESETS = 'presets';
const BINDINGS = 'bindings.yaml';
const PLUGINS = 'plugins';
const PART = /^([^.]+)\../;
const PLUGIN = /^([^.]+)\.grit$/;

const fileOf = (
  segments: readonly string[],
):
  | {
      kind: PresetFileKind.Bindings;
    }
  | {
      kind: PresetFileKind.Part | PresetFileKind.Plugin;
      name: string;
    }
  | undefined => {
  // Stryker disable next-line StringLiteral: the length check guards every read
  const [first = '', second = ''] = segments;
  const isFile = segments.length === 1;

  if (isFile && first === BINDINGS) {
    return {
      kind: PresetFileKind.Bindings,
    };
  }

  const part = isFile ? PART.exec(first)?.[1] : undefined;
  const plugin = segments.length === 2 && first === PLUGINS ? PLUGIN.exec(second)?.[1] : undefined;

  if (part !== undefined) {
    return {
      kind: PresetFileKind.Part,
      name: part,
    };
  }

  return plugin === undefined
    ? undefined
    : {
        kind: PresetFileKind.Plugin,
        name: plugin,
      };
};

const presetPathOf = (path: string): PresetPath | undefined => {
  // Stryker disable next-line StringLiteral: the file needs a fourth segment, so the scope and the tool are there
  const [root, scope = '', tool = '', ...segments] = path.split('/');
  const optional = OPTIONAL_AXES.find((axis) => axis === segments[0]);
  const file = fileOf(optional === undefined ? segments : segments.slice(1));

  return root !== PRESETS || file === undefined
    ? undefined
    : {
        ...file,
        axis: optional ?? Axis.Foundation,
        scope,
        tool,
      };
};

export type { PresetPath };
export { PresetFileKind, presetPathOf };
