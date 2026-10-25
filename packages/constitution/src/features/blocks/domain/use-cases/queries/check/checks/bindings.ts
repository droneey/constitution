import type { Axis } from '#/kernel/constants';
import { COMMON_SCOPE, SELF_PART } from '#/kernel/constants';
import { Rule } from '#/kernel/entities';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import type { RuleSlug } from '#/kernel/value-objects';
import { BlockId, PartAddress, PresetFileKind, PresetPartPath } from '#/kernel/value-objects';

import type { Binding, PresetFile } from '../../../../entities';
import { BlockGraph } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { mayReachAxis } from '../shared/axes';

enum BindingsCode {
  NotRule = 'binding-names-no-rule',
  OffAxis = 'binding-off-axis',
  OutOfReach = 'binding-out-of-reach',
  PartMissing = 'binding-part-missing',
  SettingMissing = 'binding-setting-missing',
}

interface BindingsDetails {
  readonly [BindingsCode.NotRule]: {
    readonly rule: RuleSlug;
  };
  readonly [BindingsCode.OffAxis]: {
    /** the axis whose bindings hold the binding */
    readonly axis: Axis;
    readonly rule: RuleSlug;
    readonly ruleAxis: Axis;
  };
  readonly [BindingsCode.OutOfReach]: {
    readonly part: string;
    readonly rule: RuleSlug;
    readonly ruleBlock: BlockId;
  };
  readonly [BindingsCode.PartMissing]: {
    readonly axis: Axis;
    readonly part: string;
    readonly rule: RuleSlug;
    readonly scope: string;
    readonly tool: string;
  };
  readonly [BindingsCode.SettingMissing]: {
    /** the path of the part's file */
    readonly file: string;
    readonly rule: RuleSlug;
    readonly setting: string;
  };
}

type BindingsFinding = FindingOf<BindingsDetails>;

type BindingsProblem = ProblemOf<BindingsDetails>;

const partOf = (input: {
  binding: Binding;
  presets: readonly PresetFile[];
}): PresetFile | undefined =>
  input.presets.find((preset) => {
    const path = PresetPartPath.parse(preset.path);

    return path?.kind === PresetFileKind.Part && PartAddress.equals(path, input.binding.part);
  });

// A part is named after the block its settings need — in a language's folder
// when they also need that language — and holds rules of those blocks, of the
// blocks above them, of a seam with them, or of the tool itself; self is the
// tool's own.
const isAbove = (input: { binding: Binding; graph: BlockGraph; rule: Rule }): boolean => {
  const { part } = input.binding;
  const owners = [
    part.name === SELF_PART ? part.tool : part.name,
    ...(part.scope === COMMON_SCOPE
      ? []
      : [
          part.scope,
        ]),
  ];

  const { seam } = input.rule;

  return (
    (BlockId.is(part.tool) && BlockId.equals(input.rule.block, part.tool)) ||
    owners.some(
      (owner) =>
        !(BlockId.is(owner) && input.graph.has(owner)) ||
        // Stryker disable next-line ConditionalExpression: the test only narrows the type; an absent seam equals no block
        (seam !== undefined && BlockId.equals(seam, owner)) ||
        BlockGraph.mayReferTo(input.graph, {
          from: {
            block: owner,
          },
          to: input.rule.block,
        }),
    )
  );
};

const bindingProblem = (input: {
  binding: Binding;
  graph: BlockGraph;
  presets: readonly PresetFile[];
  rule: Rule | undefined;
}): BindingsProblem | undefined => {
  const { binding, rule } = input;

  if (rule === undefined) {
    return {
      code: BindingsCode.NotRule,
      details: {
        rule: binding.rule,
      },
    };
  }

  // A part holds a rule of its own axis or of foundation, as rules refer.
  if (
    !mayReachAxis({
      from: binding.part.axis,
      to: rule.axis,
    })
  ) {
    return {
      code: BindingsCode.OffAxis,
      details: {
        axis: binding.part.axis,
        rule: rule.slug,
        ruleAxis: rule.axis,
      },
    };
  }

  if (
    !isAbove({
      binding,
      graph: input.graph,
      rule,
    })
  ) {
    return {
      code: BindingsCode.OutOfReach,
      details: {
        part: binding.part.name,
        rule: rule.slug,
        ruleBlock: rule.block,
      },
    };
  }

  const part = partOf(input);

  if (part === undefined) {
    return {
      code: BindingsCode.PartMissing,
      details: {
        axis: binding.part.axis,
        part: binding.part.name,
        rule: rule.slug,
        scope: binding.part.scope,
        tool: binding.part.tool,
      },
    };
  }

  return part.text.includes(binding.setting)
    ? undefined
    : {
        code: BindingsCode.SettingMissing,
        details: {
          file: part.path,
          rule: rule.slug,
          setting: binding.setting,
        },
      };
};

const bindingsCheck: Check<BindingsFinding> = ({
  graph,
  constitution,
}: CheckInput): readonly BindingsFinding[] => {
  const rules = Rule.bySlug(constitution.rules);

  return constitution.bindings.flatMap((binding): readonly BindingsFinding[] => {
    const problem = bindingProblem({
      binding,
      graph,
      presets: constitution.presets,
      rule: rules.get(binding.rule),
    });

    return problem === undefined
      ? []
      : [
          {
            ...problem,
            path: binding.file,
          },
        ];
  });
};

export type { BindingsDetails };
export { BindingsCode, bindingsCheck };
