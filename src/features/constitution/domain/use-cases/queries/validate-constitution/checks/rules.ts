import type { Finding } from '#/kernel';
import { ROLES, TAGS } from '#/kernel';

import type { Rule } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import type { BlocksById } from '../closure.utils';
import { mayReferTo } from '../closure.utils';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CHECK = /^(?:test|review|tool — (\S+))$/;
const REFERENCE = /^`?([^`\s]+)`?$/;

const roles: readonly string[] = ROLES;
const tags: readonly string[] = TAGS;

const at = (input: { message: string; rule: Rule }): Finding => ({
  message: `rule "${input.rule.slug}" ${input.message}`,
  path: input.rule.file,
});

const tagsOf = (rule: Rule): readonly string[] =>
  (rule.labels.tags ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag !== '');

const checkMessage = (check: string): string | undefined => {
  const role = CHECK.exec(check)?.[1];

  if (check === '') {
    return 'has no Check';
  }

  if (!CHECK.test(check)) {
    return `has the check "${check}"; a check is test, review or tool — <role>`;
  }

  return role === undefined || roles.includes(role)
    ? undefined
    : `names the role "${role}", which is not a role`;
};

const labelFindings = (rule: Rule): readonly Finding[] => {
  const ruleTags = tagsOf(rule);
  const messages = [
    SLUG.test(rule.slug) ? undefined : 'is not a kebab-case slug',
    rule.statement === '' ? 'has no statement' : undefined,
    (rule.labels.why ?? '') === '' ? 'has no Why' : undefined,
    checkMessage(rule.labels.check ?? ''),
    ruleTags.length === 0 ? 'has no Tags' : undefined,
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

  return mayReferTo({
    byId: input.byId,
    from: input.rule,
    to: target.block,
  })
    ? undefined
    : `implements "${slug}" of ${target.block}, which its block may not refer to`;
};

const rulesCheck: Check = ({
  byId,
  constitution,
}: CheckInput): readonly Finding[] => {
  const slugs = firstBySlug(constitution.rules);

  return constitution.rules.flatMap((rule) => {
    const first = slugs.get(rule.slug);
    const reference = implementsMessage({
      byId,
      rule,
      slugs,
    });

    return [
      ...labelFindings(rule),
      ...(first === undefined || first === rule
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
