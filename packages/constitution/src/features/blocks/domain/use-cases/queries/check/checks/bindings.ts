import { COMMON_SCOPE, SELF_PART } from '#/kernel/constants';
import { Rule } from '#/kernel/entities';
import type { Finding, Problem } from '#/kernel/types';
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
}): Problem | undefined => {
  const { binding, rule } = input;

  if (rule === undefined) {
    return {
      code: BindingsCode.NotRule,
      message: `binds "${binding.rule}", which is not a rule`,
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
      message: `binds ${rule.slug}, a rule of ${rule.axis}, under ${binding.part.axis}`,
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
      message: `binds ${rule.slug}, a rule of ${rule.block}, to the part ${binding.part.name}, which may hold only rules of its block, of the blocks above it, of a seam with it or of its tool`,
    };
  }

  const part = partOf(input);

  if (part === undefined) {
    return {
      code: BindingsCode.PartMissing,
      message: `binds ${rule.slug} to the part ${binding.part.name}, which presets/${binding.part.scope}/${binding.part.tool}/${binding.part.axis}/ does not hold`,
    };
  }

  return part.text.includes(binding.setting)
    ? undefined
    : {
        code: BindingsCode.SettingMissing,
        message: `binds ${rule.slug} to "${binding.setting}", which ${part.path} does not hold`,
      };
};

const bindingsCheck: Check = ({ graph, constitution }: CheckInput): readonly Finding[] => {
  const rules = Rule.bySlug(constitution.rules);

  return constitution.bindings.flatMap((binding) => {
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

export { bindingsCheck };
