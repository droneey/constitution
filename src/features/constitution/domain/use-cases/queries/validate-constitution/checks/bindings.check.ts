import type { Finding } from '#/kernel';
import { Axis } from '#/kernel';

import type { Binding, PresetFile, Rule } from '../../../../entities';
import type { BlocksById } from '../../../../utils';
import { mayReferTo, PresetFileKind, presetPathOf } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

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

const bindingMessage = (input: {
  binding: Binding;
  byId: BlocksById;
  presets: readonly PresetFile[];
  rule: Rule | undefined;
}): string | undefined => {
  const { binding, rule } = input;

  if (rule === undefined) {
    return `binds "${binding.rule}", which is not a rule`;
  }

  // A part holds a rule of its own axis or of foundation, as rules refer.
  if (rule.axis !== binding.axis && rule.axis !== Axis.Foundation) {
    return `binds ${rule.slug}, a rule of ${rule.axis}, under ${binding.axis}`;
  }

  if (
    !isAbove({
      binding,
      byId: input.byId,
      rule,
    })
  ) {
    return `binds ${rule.slug}, a rule of ${rule.block}, to the part ${binding.part}, which may hold only rules of its block, of the blocks above it, of a seam with it or of its tool`;
  }

  const part = partOf(input);

  if (part === undefined) {
    return `binds ${rule.slug} to the part ${binding.part}, which presets/${binding.scope}/${binding.tool}/${binding.axis}/ does not hold`;
  }

  return part.text.includes(binding.setting)
    ? undefined
    : `binds ${rule.slug} to "${binding.setting}", which ${part.path} does not hold`;
};

const bindingsCheck: Check = ({ byId, constitution }: CheckInput): readonly Finding[] => {
  const rules = new Map(
    constitution.rules.map((rule) => [
      rule.slug,
      rule,
    ]),
  );

  return constitution.bindings.flatMap((binding) => {
    const message = bindingMessage({
      binding,
      byId,
      presets: constitution.presets,
      rule: rules.get(binding.rule),
    });

    return message === undefined
      ? []
      : [
          {
            message,
            path: binding.file,
          },
        ];
  });
};

export { bindingsCheck };
