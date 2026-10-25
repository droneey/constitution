import { ValueFailure } from '#/kernel/errors';
import type { Finding } from '#/kernel/types';
import type { PresetFolder } from '#/kernel/value-objects';
import { PartAddress, PresetFileKind, PresetPartPath, RuleSlug } from '#/kernel/value-objects';

import type { BindingsParser } from '../../../../../../../contracts';
import type { PresetFile } from '../../../../../../../entities';
import { Binding, ReadStatus } from '../../../../../../../entities';

enum BindingsFileCode {
  NotYaml = 'bindings-not-yaml',
  OffSchema = 'bindings-off-schema',
}

interface BindingsLoaded {
  readonly bindings: readonly Binding[];
  readonly findings: readonly Finding[];
}

const loadFile = (input: {
  folder: PresetFolder;
  parser: BindingsParser;
  preset: PresetFile;
}): BindingsLoaded => {
  const { path } = input.preset;
  const read = input.parser.parse(input.preset.text);

  if (read.status === ReadStatus.NotYaml) {
    return {
      bindings: [],
      findings: [
        {
          code: BindingsFileCode.NotYaml,
          message: `is not valid YAML: ${read.reason}`,
          path,
        },
      ],
    };
  }

  if (read.status === ReadStatus.Mismatched) {
    return {
      bindings: [],
      findings: read.issues.map((issue) => ({
        code: BindingsFileCode.OffSchema,
        message: `does not match its schema: ${issue.field === '' ? '<root>' : issue.field}: ${issue.message}`,
        path,
      })),
    };
  }

  const candidateOf = (name: string): unknown => ({
    axis: input.folder.axis,
    name,
    scope: input.folder.scope,
    tool: input.folder.tool,
  });

  const parts = Object.keys(read.document);
  const entries = Object.entries(read.document).flatMap(([name, rules]) => {
    const part = candidateOf(name);

    return PartAddress.is(part)
      ? Object.entries(rules).map(([rule, settings]) => ({
          part,
          rule,
          settings,
        }))
      : [];
  });

  return {
    bindings: entries.flatMap(({ part, rule, settings }) =>
      RuleSlug.is(rule)
        ? settings.map((setting) =>
            Binding.create({
              file: path,
              part,
              rule,
              setting,
            }),
          )
        : [],
    ),
    findings: [
      ...parts
        .filter((name) => !PartAddress.is(candidateOf(name)))
        .map((name) => ({
          code: ValueFailure.PartAddress,
          message: `binds the part "${name}", which is not a file name: it is empty or holds a "/"`,
          path,
        })),
      ...entries
        .filter(({ rule }) => !RuleSlug.is(rule))
        .map(({ rule }) => ({
          code: ValueFailure.RuleSlug,
          message: `binds "${rule}", which is not a kebab-case slug`,
          path,
        })),
    ],
  };
};

const readBindings = (input: {
  parser: BindingsParser;
  presets: readonly PresetFile[];
}): BindingsLoaded => {
  const loaded = input.presets.flatMap((preset) => {
    const path = PresetPartPath.parse(preset.path);

    return path?.kind === PresetFileKind.Bindings
      ? [
          loadFile({
            folder: path,
            parser: input.parser,
            preset,
          }),
        ]
      : [];
  });

  return {
    bindings: loaded.flatMap((file) => file.bindings),
    findings: loaded.flatMap((file) => file.findings),
  };
};

export { readBindings };
