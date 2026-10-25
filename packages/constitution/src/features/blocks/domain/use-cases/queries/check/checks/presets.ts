import { COMMON_SCOPE, Layer, SELF_PART } from '#/kernel/constants';
import { Rule } from '#/kernel/entities';
import type { Finding, Problem } from '#/kernel/types';
import type { PresetFolder } from '#/kernel/value-objects';
import { BlockId, PresetFileKind, PresetPartPath, RuleSlug } from '#/kernel/value-objects';

import { BlockGraph } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

enum PresetsCode {
  StrayFile = 'stray-preset-file',
  ToolNamesNoBlock = 'preset-tool-names-no-block',
  ScopeNotCovered = 'preset-scope-not-covered',
  PartNamesNoBlock = 'part-names-no-block',
  PluginNamesNoRule = 'plugin-names-no-rule',
  PluginOffAxis = 'plugin-off-axis',
}

const LAYOUT =
  'is not a part of a preset: presets/<scope>/<tool>/<axis>/<block>.<extension>, presets/<scope>/<tool>/<axis>/plugins/<rule>.grit, presets/<scope>/<tool>/<axis>/bindings.yaml, the axis foundation, architecture or workflow, or a module the configurations of a scope share, presets/<scope>/<name>.<extension>';
// a module the configurations of a scope import, beside its tools' folders
const SHARED = /^presets\/([^/]+)\/[^/.][^/]*\.[^/.]+$/;

const nameProblem = (input: {
  isBlock: (name: string) => boolean;
  preset: PresetPartPath;
  rules: ReadonlyMap<RuleSlug, Rule>;
}): Problem | undefined => {
  const { preset } = input;

  if (preset.kind === PresetFileKind.Bindings) {
    return undefined;
  }

  if (preset.kind === PresetFileKind.Part) {
    const { name } = preset;

    return name === SELF_PART || input.isBlock(name)
      ? undefined
      : {
          code: PresetsCode.PartNamesNoBlock,
          message: `is named "${name}", which is neither a block nor ${SELF_PART}`,
        };
  }

  const rule = RuleSlug.is(preset.rule) ? input.rules.get(preset.rule) : undefined;

  if (rule === undefined) {
    return {
      code: PresetsCode.PluginNamesNoRule,
      message: `is named "${preset.rule}", which is not a rule; a plugin is named after the rule it holds`,
    };
  }

  return rule.axis === preset.axis
    ? undefined
    : {
        code: PresetsCode.PluginOffAxis,
        message: `holds ${preset.rule}, a rule of ${rule.axis}, in ${preset.axis}/plugins/`,
      };
};

const scopeProblem = (input: { graph: BlockGraph; folder: PresetFolder }): Problem | undefined => {
  const { graph } = input;
  const { scope, tool } = input.folder;
  const covered = BlockGraph.named(graph, tool)?.frontMatter.languages ?? [];
  const language = BlockGraph.named(graph, scope);
  const isCovered =
    language?.layer === Layer.Language &&
    (covered.length === 0 || covered.some((id) => BlockId.equals(id, language.id)));

  return scope === COMMON_SCOPE || isCovered
    ? undefined
    : {
        code: PresetsCode.ScopeNotCovered,
        message: `is in presets/${scope}/, which is neither ${COMMON_SCOPE} nor a language ${tool} covers`,
      };
};

const presetsCheck: Check = ({ graph, constitution }: CheckInput): readonly Finding[] => {
  const rules = Rule.bySlug(constitution.rules);

  const isBlock = (name: string): boolean => BlockGraph.named(graph, name) !== undefined;

  return constitution.presets.flatMap(({ path }) => {
    const shared = SHARED.exec(path)?.[1];

    if (
      shared === COMMON_SCOPE ||
      // Stryker disable next-line ConditionalExpression: no block has an undefined id, so the test only narrows the type
      (shared !== undefined && BlockGraph.named(graph, shared)?.layer === Layer.Language)
    ) {
      return [];
    }

    const preset = PresetPartPath.parse(path);

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
        graph,
        folder: preset,
      }),
      nameProblem({
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
