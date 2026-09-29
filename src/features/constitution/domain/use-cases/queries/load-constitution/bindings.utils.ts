import type { Finding } from '#/kernel';
import { AXES } from '#/kernel';

import type { BindingsParser } from '../../../contracts';
import type { Binding, PresetFile } from '../../../entities';
import { PresetFileKind, presetPathOf } from '../../../utils';

interface BindingsLoaded {
  bindings: readonly Binding[];
  findings: readonly Finding[];
}

const loadFile = (input: {
  parser: BindingsParser;
  preset: PresetFile;
  scope: string;
  tool: string;
}): BindingsLoaded => {
  const { path } = input.preset;
  const read = input.parser.parse(input.preset.text);

  if (read.status === 'not-yaml') {
    return {
      bindings: [],
      findings: [
        {
          message: `is not valid YAML: ${read.reason}`,
          path,
        },
      ],
    };
  }

  if (read.status === 'mismatched') {
    return {
      bindings: [],
      findings: read.issues.map((issue) => ({
        message: `does not match its schema: ${issue.field === '' ? '<root>' : issue.field}: ${issue.message}`,
        path,
      })),
    };
  }

  return {
    bindings: AXES.flatMap((axis) =>
      Object.entries(read.document[axis] ?? {}).flatMap(([part, rules]) =>
        Object.entries(rules).flatMap(([rule, settings]) =>
          settings.map((setting) => ({
            axis,
            file: path,
            part,
            rule,
            scope: input.scope,
            setting,
            tool: input.tool,
          })),
        ),
      ),
    ),
    findings: [],
  };
};

const bindingsOf = (input: {
  parser: BindingsParser;
  presets: readonly PresetFile[];
}): BindingsLoaded => {
  const loaded = input.presets.flatMap((preset) => {
    const path = presetPathOf(preset.path);

    return path?.kind === PresetFileKind.Bindings
      ? [
          loadFile({
            parser: input.parser,
            preset,
            scope: path.scope,
            tool: path.tool,
          }),
        ]
      : [];
  });

  return {
    bindings: loaded.flatMap((file) => file.bindings),
    findings: loaded.flatMap((file) => file.findings),
  };
};

export { bindingsOf };
