import type { Finding } from '#/kernel';
import { Axis, LEVELS, ROLES, Tag } from '#/kernel';

import type { Rule } from '../../../../entities';
import type { BlocksById } from '../../../../utils';
import { checkOf, mayReferTo, tagsOf } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REFERENCE = /^`([^`\s]+)`$/;

const roles: readonly string[] = ROLES;
const tags: readonly string[] = Object.values(Tag);

const at = (input: { message: string; rule: Rule }): Finding => ({
  message: `rule "${input.rule.slug}" ${input.message}`,
  path: input.rule.file,
});

const checkMessage = (rule: Rule): string | undefined => {
  const check = rule.labels.check ?? '';
  const read = checkOf(rule);

  if (check === '') {
    return 'has no Check';
  }

  if (read.kind === 'unknown') {
    return `has the check "${check}"; a check is test, review or tool — <role>`;
  }

  return read.kind !== 'tool' || roles.includes(read.role)
    ? undefined
    : `names the role "${read.role}", which is not a role`;
};

const labelFindings = (rule: Rule): readonly Finding[] => {
  const ruleTags = tagsOf(rule);
  const messages = [
    SLUG.test(rule.slug) ? undefined : 'is not a kebab-case slug',
    rule.statement === '' ? 'has no statement' : undefined,
    (rule.labels.why ?? '') === '' ? 'has no Why' : undefined,
    checkMessage(rule),
    ruleTags.length === 0 && rule.axis === Axis.Foundation
      ? 'has no Tags; a foundation rule carries a lens'
      : undefined,
    ...ruleTags
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

const implementsMessage = (input: {
  byId: BlocksById;
  rule: Rule;
  slugs: ReadonlyMap<string, Rule>;
}): string | undefined => {
  const raw = input.rule.labels.implements ?? '';
  const slug = REFERENCE.exec(raw)?.[1] ?? raw;
  const target = input.slugs.get(slug);

  if (raw === '') {
    return undefined;
  }

  if (target === undefined) {
    return `implements "${slug}", which is not a rule`;
  }

  if (target === input.rule) {
    return 'implements itself';
  }

  if (
    !mayReferTo({
      byId: input.byId,
      from: input.rule,
      to: target.block,
    })
  ) {
    return `implements "${slug}" of ${target.block}, which its block may not refer to`;
  }

  if (target.axis !== input.rule.axis && target.axis !== Axis.Foundation) {
    return `implements "${slug}" on ${target.axis}, which a rule on ${input.rule.axis} may not refer to`;
  }

  return LEVELS.indexOf(input.rule.level) > LEVELS.indexOf(target.level)
    ? `is ${input.rule.level} while it implements the ${target.level} rule "${slug}"; a rule is never looser than the rule it implements`
    : undefined;
};

const rulesCheck: Check = ({
  byId,
  constitution,
}: CheckInput): readonly Finding[] => {
  const slugs = firstBySlug(constitution.rules);

  return constitution.rules.flatMap((rule) => {
    const first = slugs.get(rule.slug) ?? rule;
    const reference = implementsMessage({
      byId,
      rule,
      slugs,
    });

    return [
      ...labelFindings(rule),
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
