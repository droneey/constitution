import type { Finding, Problem } from '#/kernel/types';

import type { Binding, PresetFile, Rule } from '../../../../entities';
import type { BlocksById } from '../../../../utils';
import { mayReachAxis, mayReferTo, PresetFileKind, presetPathOf } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

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
    const path = presetPathOf(preset.path);

    return (
      path?.kind === PresetFileKind.Part &&
      path.scope === input.binding.scope &&
      path.tool === input.binding.tool &&
      path.axis === input.binding.axis &&
      path.name === input.binding.part
    );
  });

const SELF = 'self';
const COMMON = 'common';

// A part is named after the block its settings need — in a language's folder
// when they also need that language — and holds rules of those blocks, of the
// blocks above them, of a seam with them, or of the tool itself; self is the
// tool's own.
const isAbove = (input: { binding: Binding; byId: BlocksById; rule: Rule }): boolean => {
  const owners = [
    input.binding.part === SELF ? input.binding.tool : input.binding.part,
    ...(input.binding.scope === COMMON
      ? []
      : [
          input.binding.scope,
        ]),
  ];

  return (
    input.rule.block === input.binding.tool ||
    owners.some(
      (owner) =>
        owner === input.rule.with ||
        !input.byId.has(owner) ||
        mayReferTo({
          byId: input.byId,
          from: {
            block: owner,
            with: undefined,
          },
          to: input.rule.block,
        }),
    )
  );
};

const bindingProblem = (input: {
  binding: Binding;
  byId: BlocksById;
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
      from: binding.axis,
      to: rule.axis,
    })
  ) {
    return {
      code: BindingsCode.OffAxis,
      message: `binds ${rule.slug}, a rule of ${rule.axis}, under ${binding.axis}`,
    };
  }

  if (
    !isAbove({
      binding,
      byId: input.byId,
      rule,
    })
  ) {
    return {
      code: BindingsCode.OutOfReach,
      message: `binds ${rule.slug}, a rule of ${rule.block}, to the part ${binding.part}, which may hold only rules of its block, of the blocks above it, of a seam with it or of its tool`,
    };
  }

  const part = partOf(input);

  if (part === undefined) {
    return {
      code: BindingsCode.PartMissing,
      message: `binds ${rule.slug} to the part ${binding.part}, which presets/${binding.scope}/${binding.tool}/${binding.axis}/ does not hold`,
    };
  }

  return part.text.includes(binding.setting)
    ? undefined
    : {
        code: BindingsCode.SettingMissing,
        message: `binds ${rule.slug} to "${binding.setting}", which ${part.path} does not hold`,
      };
};

const bindingsCheck: Check = ({ byId, constitution }: CheckInput): readonly Finding[] => {
  const rules = new Map(
    constitution.rules.map((rule) => [
      rule.slug,
      rule,
    ]),
  );

  return constitution.bindings.flatMap((binding) => {
    const problem = bindingProblem({
      binding,
      byId,
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
