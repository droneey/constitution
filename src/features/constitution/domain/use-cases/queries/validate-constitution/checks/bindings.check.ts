import type { Finding } from '#/kernel';
import { Axis } from '#/kernel';

import type { Binding, Constitution, PresetFile, Rule } from '../../../../entities';
import type { BlocksById } from '../../../../utils';
import { checkOf, mayReferTo, PresetFileKind, presetPathOf } from '../../../../utils';
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

const bindingFindings = (input: {
  byId: BlocksById;
  constitution: Constitution;
}): readonly Finding[] => {
  const { constitution } = input;
  const rules = new Map(
    constitution.rules.map((rule) => [
      rule.slug,
      rule,
    ]),
  );

  return constitution.bindings.flatMap((binding) => {
    const message = bindingMessage({
      binding,
      byId: input.byId,
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

const roleOf = (rule: Rule): string | undefined => {
  const check = checkOf(rule);

  // Stryker disable next-line ConditionalExpression: only a tool check has a role
  return check.kind === 'tool' ? check.role : undefined;
};

// A rule a tool checks is held by a binding, by the tool block's own account
// of its run, by a rule under it that is held, or by no tool with presets.
const unheldFindings = (input: {
  byId: BlocksById;
  constitution: Constitution;
}): readonly Finding[] => {
  const { bindings, blocks, presets, rules } = input.constitution;
  const bound = new Set(bindings.map((binding) => binding.rule));
  const toolsWithPresets = new Set(presets.map((preset) => presetPathOf(preset.path)?.tool));
  const presetRoles = new Set<string>(
    blocks
      .filter((block) => toolsWithPresets.has(block.id))
      .flatMap((block) => block.frontMatter.checks),
  );
  const checksOf = (block: string): readonly string[] =>
    // Stryker disable next-line OptionalChaining,ArrayDeclaration: every rule's block is loaded
    input.byId.get(block)?.frontMatter.checks ?? [];
  const isHeld = (rule: Rule, role: string): boolean =>
    bound.has(rule.slug) ||
    !presetRoles.has(role) ||
    checksOf(rule.block).includes(role) ||
    rules.some(
      (child) => child.parent === rule.slug && roleOf(child) === role && isHeld(child, role),
    );

  return rules.flatMap((rule) => {
    const role = roleOf(rule);

    // Stryker disable next-line ConditionalExpression: a rule no tool checks has no role for a tool with presets to hold
    return role === undefined || isHeld(rule, role)
      ? []
      : [
          {
            message: `says a tool holds ${rule.slug} (tool/${role}), but no binding holds it, nor a rule that carries it out`,
            path: rule.file,
          },
        ];
  });
};

const bindingsCheck: Check = ({ byId, constitution }: CheckInput): readonly Finding[] => [
  ...bindingFindings({
    byId,
    constitution,
  }),
  ...unheldFindings({
    byId,
    constitution,
  }),
];

export { bindingsCheck };
