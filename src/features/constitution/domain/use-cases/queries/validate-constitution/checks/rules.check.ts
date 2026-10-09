import { Axis, LEVELS, Tag } from '#/kernel/constants';
import type { Finding } from '#/kernel/types';

import type { Rule } from '../../../../entities';
import type { BlocksById } from '../../../../utils';
import { axisNameOf, mayCarryOut } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const tags: readonly string[] = Object.values(Tag);

const at = (input: { message: string; rule: Rule }): Finding => ({
  message: `rule "${input.rule.slug}" ${input.message}`,
  path: input.rule.file,
});

const fieldFindings = (rule: Rule): readonly Finding[] => {
  const messages = [
    SLUG.test(rule.slug) ? undefined : 'is not a kebab-case slug',
    rule.statement === '' ? 'has no statement' : undefined,
    rule.why === '' ? 'has no Why' : undefined,
    ...rule.ownTags
      .filter((tag) => !tags.includes(tag))
      .map((tag) => `has the tag "${tag}", which is not a lens`),
  ];

  return messages.flatMap((message) =>
    message === undefined
      ? []
      : [
          at({
            message,
            rule,
          }),
        ],
  );
};

const firstBySlug = (rules: readonly Rule[]): ReadonlyMap<string, Rule> => {
  const first = new Map<string, Rule>();

  for (const rule of rules) {
    if (!first.has(rule.slug)) {
      first.set(rule.slug, rule);
    }
  }

  return first;
};

const parentOf = (input: { rule: Rule; slugs: ReadonlyMap<string, Rule> }): Rule | undefined =>
  // Stryker disable next-line StringLiteral: no rule has an empty slug
  input.slugs.get(input.rule.parent ?? '');

const cycleOf = (input: {
  rule: Rule;
  slugs: ReadonlyMap<string, Rule>;
}): readonly string[] | undefined => {
  const chain = [
    input.rule.slug,
  ];
  let next = parentOf(input);

  while (next !== undefined && !chain.includes(next.slug)) {
    chain.push(next.slug);
    next = parentOf({
      rule: next,
      slugs: input.slugs,
    });
  }

  return next?.slug === input.rule.slug
    ? [
        ...chain,
        next.slug,
      ]
    : undefined;
};

// Where the parent sits and what level it gives, once the parent is a rule of
// another block outside any cycle.
const placementMessage = (input: {
  byId: BlocksById;
  parent: string;
  rule: Rule;
  target: Rule;
}): string | undefined => {
  const { parent, rule, target } = input;

  if (
    !mayCarryOut({
      byId: input.byId,
      from: rule,
      to: target,
    })
  ) {
    return target.with === undefined
      ? `carries out "${parent}" of ${target.block}, which its block may not refer to`
      : `carries out "${parent}" of ${target.block} with ${target.with}, which its place does not reach`;
  }

  if (target.axis !== rule.axis && target.axis !== Axis.Foundation) {
    return `carries out "${parent}" on ${target.axis}, which a rule on ${axisNameOf(rule.axis)} may not refer to`;
  }

  if (LEVELS.indexOf(rule.level) > LEVELS.indexOf(target.level)) {
    return `is ${rule.level} while it carries out the ${target.level} rule "${parent}"; a rule is never looser than the rule it carries out`;
  }

  return rule.statedLevel === undefined
    ? `carries out "${parent}" without a level; a rule that carries out another states its own, never looser than it`
    : undefined;
};

const parentMessage = (input: {
  byId: BlocksById;
  rule: Rule;
  slugs: ReadonlyMap<string, Rule>;
}): string | undefined => {
  const { parent } = input.rule;
  const target = parentOf(input);
  const cycle = cycleOf(input);

  if (parent === undefined) {
    return undefined;
  }

  if (target === undefined) {
    return `carries out "${parent}", which is not a rule`;
  }

  if (cycle !== undefined) {
    return `carries out a chain that comes back to it: ${cycle.join(' → ')}`;
  }

  return target.block === input.rule.block
    ? `carries out "${parent}", a rule of its own block; a rule carries out only a rule of another block`
    : placementMessage({
        byId: input.byId,
        parent,
        rule: input.rule,
        target,
      });
};

const rulesCheck: Check = ({ byId, constitution }: CheckInput): readonly Finding[] => {
  const slugs = firstBySlug(constitution.rules);

  return constitution.rules.flatMap((rule) => {
    const first = slugs.get(rule.slug) ?? rule;
    const reference = parentMessage({
      byId,
      rule,
      slugs,
    });

    return [
      ...fieldFindings(rule),
      ...(first === rule
        ? []
        : [
            at({
              message: `is also defined in ${first.file}`,
              rule,
            }),
          ]),
      ...(reference === undefined
        ? []
        : [
            at({
              message: reference,
              rule,
            }),
          ]),
    ];
  });
};

export { rulesCheck };
