enum PresetFileKind {
  Bindings = 'bindings',
  Part = 'part',
  Plugin = 'plugin',
}

type PresetPath =
  | {
      kind: PresetFileKind.Bindings;
      scope: string;
      tool: string;
    }
  | {
      axis: string;
      kind: PresetFileKind.Part | PresetFileKind.Plugin;
      name: string;
      scope: string;
      tool: string;
    };

// presets/<scope>/<tool>/bindings.yaml, <scope>/<tool>/<axis>/<part>.<extension>,
// or <scope>/<tool>/<axis>/plugins/<rule>.grit
const BINDINGS = /^presets\/([^/]+)\/([^/]+)\/bindings\.yaml$/;
const PART = /^presets\/([^/]+)\/([^/]+)\/([^/]+)\/([^/.]+)\.[^/]+$/;
const PLUGIN = /^presets\/([^/]+)\/([^/]+)\/([^/]+)\/plugins\/([^/.]+)\.grit$/;

const presetPathOf = (path: string): PresetPath | undefined => {
  const bindings = BINDINGS.exec(path);

  if (bindings !== null) {
    // Stryker disable next-line StringLiteral: the pattern always captures the scope and the tool
    const [, scope = '', tool = ''] = bindings;

    return {
      kind: PresetFileKind.Bindings,
      scope,
      tool,
    };
  }

  const plugin = PLUGIN.exec(path);
  const [match, kind] =
    plugin === null
      ? [
          PART.exec(path),
          PresetFileKind.Part,
        ]
      : [
          plugin,
          PresetFileKind.Plugin,
        ];

  if (match === null) {
    return undefined;
  }

  // Stryker disable next-line StringLiteral: both patterns always capture the scope, the tool, the axis and the name
  const [, scope = '', tool = '', axis = '', name = ''] = match;

  return {
    axis,
    kind,
    name,
    scope,
    tool,
  };
};

export type { PresetPath };
export { PresetFileKind, presetPathOf };
