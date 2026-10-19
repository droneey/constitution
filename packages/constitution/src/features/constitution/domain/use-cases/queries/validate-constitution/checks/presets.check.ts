import { Layer } from '#/kernel/constants';
import type { Finding, Problem } from '#/kernel/types';

import type { Rule } from '../../../../entities';
import type { BlocksById, PresetPath } from '../../../../utils';
import { PresetFileKind, presetPathOf } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

enum PresetsCode {
  StrayFile = 'stray-preset-file',
  ToolNamesNoBlock = 'preset-tool-names-no-block',
  ScopeNotCovered = 'preset-scope-not-covered',
  PartNamesNoBlock = 'part-names-no-block',
  PluginNamesNoRule = 'plugin-names-no-rule',
  PluginOffAxis = 'plugin-off-axis',
}

const SELF = 'self';
const COMMON = 'common';
const LAYOUT =
  'is not a part of a preset: presets/<scope>/<tool>/<axis>/<block>.<extension>, presets/<scope>/<tool>/<axis>/plugins/<rule>.grit or presets/<scope>/<tool>/<axis>/bindings.yaml, the axis foundation, architecture or workflow';

type PartPath = Exclude<
  PresetPath,
  {
    kind: PresetFileKind.Bindings;
  }
>;

const nameProblem = (input: {
  isBlock: (id: string) => boolean;
  preset: PartPath;
  rules: ReadonlyMap<string, Rule>;
}): Problem | undefined => {
  const { name, axis } = input.preset;

  if (input.preset.kind === PresetFileKind.Part) {
    return name === SELF || input.isBlock(name)
      ? undefined
      : {
          code: PresetsCode.PartNamesNoBlock,
          message: `is named "${name}", which is neither a block nor ${SELF}`,
        };
  }

  const rule = input.rules.get(name);

  if (rule === undefined) {
    return {
      code: PresetsCode.PluginNamesNoRule,
      message: `is named "${name}", which is not a rule; a plugin is named after the rule it holds`,
    };
  }

  return rule.axis === axis
    ? undefined
    : {
        code: PresetsCode.PluginOffAxis,
        message: `holds ${name}, a rule of ${rule.axis}, in ${axis}/plugins/`,
      };
};

const scopeProblem = (input: { byId: BlocksById; preset: PresetPath }): Problem | undefined => {
  const { scope, tool } = input.preset;
  const covered = input.byId.get(tool)?.frontMatter.languages ?? [];
  const isCovered =
    input.byId.get(scope)?.layer === Layer.Language &&
    (covered.length === 0 || covered.includes(scope));

  return scope === COMMON || isCovered
    ? undefined
    : {
        code: PresetsCode.ScopeNotCovered,
        message: `is in presets/${scope}/, which is neither ${COMMON} nor a language ${tool} covers`,
      };
};

const presetsCheck: Check = ({ byId, constitution }: CheckInput): readonly Finding[] => {
  const rules = new Map(
    constitution.rules.map((rule) => [
      rule.slug,
      rule,
    ]),
  );
  const isBlock = (id: string): boolean => byId.has(id);

  return constitution.presets.flatMap(({ path }) => {
    const preset = presetPathOf(path);

    if (preset === undefined) {
      return [
        {
          code: PresetsCode.StrayFile,
          message: LAYOUT,
          path,
        },
      ];
    }

    return [
      isBlock(preset.tool)
        ? undefined
        : {
            code: PresetsCode.ToolNamesNoBlock,
            message: `is in presets/${preset.scope}/${preset.tool}/, which names no block`,
          },
      scopeProblem({
        byId,
        preset,
      }),
      preset.kind === PresetFileKind.Bindings
        ? undefined
        : nameProblem({
            isBlock,
            preset,
            rules,
          }),
    ].flatMap((problem) =>
      problem === undefined
        ? []
        : [
            {
              ...problem,
              path,
            },
          ],
    );
  });
};

export { presetsCheck };
