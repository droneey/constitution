import type { Axis } from '#/kernel/constants';
import { COMMON_SCOPE, Layer, SELF_PART } from '#/kernel/constants';
import { Rule } from '#/kernel/entities';
import type { FindingOf, ProblemOf } from '#/kernel/types';
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

interface PresetsDetails {
  readonly [PresetsCode.StrayFile]: object;
  readonly [PresetsCode.ToolNamesNoBlock]: {
    readonly scope: string;
    readonly tool: string;
  };
  readonly [PresetsCode.ScopeNotCovered]: {
    readonly scope: string;
    readonly tool: string;
  };
  readonly [PresetsCode.PartNamesNoBlock]: {
    readonly name: string;
  };
  readonly [PresetsCode.PluginNamesNoRule]: {
    readonly rule: string;
  };
  readonly [PresetsCode.PluginOffAxis]: {
    /** the axis whose plugins folder holds the plugin */
    readonly axis: Axis;
    readonly rule: RuleSlug;
    readonly ruleAxis: Axis;
  };
}

type PresetsFinding = FindingOf<PresetsDetails>;

type PresetsProblem = ProblemOf<PresetsDetails>;

// a module the configurations of a scope import, beside its tools' folders
const SHARED = /^presets\/([^/]+)\/[^/.][^/]*\.[^/.]+$/;

const nameProblem = (input: {
  isBlock: (name: string) => boolean;
  preset: PresetPartPath;
  rules: ReadonlyMap<RuleSlug, Rule>;
}): PresetsProblem | undefined => {
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
          details: {
            name,
          },
        };
  }

  const rule = RuleSlug.is(preset.rule) ? input.rules.get(preset.rule) : undefined;

  if (rule === undefined) {
    return {
      code: PresetsCode.PluginNamesNoRule,
      details: {
        rule: preset.rule,
      },
    };
  }

  return rule.axis === preset.axis
    ? undefined
    : {
        code: PresetsCode.PluginOffAxis,
        details: {
          axis: preset.axis,
          rule: rule.slug,
          ruleAxis: rule.axis,
        },
      };
};

const scopeProblem = (input: {
  graph: BlockGraph;
  folder: PresetFolder;
}): PresetsProblem | undefined => {
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
        details: {
          scope,
          tool,
        },
      };
};

const presetsCheck: Check<PresetsFinding> = ({
  graph,
  constitution,
}: CheckInput): readonly PresetsFinding[] => {
  const rules = Rule.bySlug(constitution.rules);

  const isBlock = (name: string): boolean => BlockGraph.named(graph, name) !== undefined;

  return constitution.presets.flatMap(({ path }): readonly PresetsFinding[] => {
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
          details: {},
          path,
        },
      ];
    }

    const problems: readonly (PresetsProblem | undefined)[] = [
      isBlock(preset.tool)
        ? undefined
        : {
            code: PresetsCode.ToolNamesNoBlock,
            details: {
              scope: preset.scope,
              tool: preset.tool,
            },
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
    ];

    return problems.flatMap((problem) =>
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

export type { PresetsDetails };
export { PresetsCode, presetsCheck };
