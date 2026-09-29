enum PresetFileKind {
  Bindings = 'bindings',
  Part = 'part',
  Plugin = 'plugin',
}

type PresetPath =
  | {
      kind: PresetFileKind.Bindings;
      tool: string;
    }
  | {
      axis: string;
      kind: PresetFileKind.Part | PresetFileKind.Plugin;
      name: string;
      tool: string;
    };

// presets/<tool>/bindings.yaml, <axis>/<part>.<extension>, or <axis>/plugins/<rule>.grit
const BINDINGS = /^presets\/([^/]+)\/bindings\.yaml$/;
const PART = /^presets\/([^/]+)\/([^/]+)\/([^/.]+)\.[^/]+$/;
const PLUGIN = /^presets\/([^/]+)\/([^/]+)\/plugins\/([^/.]+)\.grit$/;

const presetPathOf = (path: string): PresetPath | undefined => {
  const bindings = BINDINGS.exec(path);

  if (bindings !== null) {
    // Stryker disable next-line StringLiteral: the pattern always captures the tool
    const [, tool = ''] = bindings;

    return {
      kind: PresetFileKind.Bindings,
      tool,
    };
  }

  const plugin = PLUGIN.exec(path);
  const part = PART.exec(path);
  const [match, kind] =
    plugin === null
      ? [
          part,
          PresetFileKind.Part,
        ]
      : [
          plugin,
          PresetFileKind.Plugin,
        ];

  if (match === null) {
    return undefined;
  }

  // Stryker disable next-line StringLiteral: both patterns always capture all three
  const [, tool = '', axis = '', name = ''] = match;

  return {
    axis,
    kind,
    name,
    tool,
  };
};

export type { PresetPath };
export { PresetFileKind, presetPathOf };
