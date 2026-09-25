import type { Constitution, Rule } from '#/features/constitution';
import type { Finding } from '#/kernel';
import { ROLES, TAGS } from '#/kernel';

import type { Check } from '../check.types';
import type { BlocksById } from '../closure.utils';
import { byIdOf, mayReferTo } from '../closure.utils';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CHECK = /^(?:test|review|tool — (\S+))$/;
const REFERENCE = /^`?([^`\s]+)`?$/;

const roles: readonly string[] = ROLES;
const tags: readonly string[] = TAGS;

const at = (rule: Rule, message: string): Finding => ({
  message: `rule "${rule.slug}" ${message}`,
  path: rule.file,
});

const tagsOf = (rule: Rule): readonly string[] =>
  (rule.labels.tags ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag !== '');

const checkFindings = (rule: Rule): readonly Finding[] => {
  const check = rule.labels.check ?? '';
  const match = CHECK.exec(check);
  const role = match?.[1];

  if (check === '') {
    return [
      at(rule, 'has no Check'),
    ];
  }

  if (match === null) {
    return [
      at(
        rule,
        `has the check "${check}"; a check is test, review or tool — <role>`,
      ),
    ];
  }

  return role === undefined || roles.includes(role)
    ? []
    : [
        at(rule, `names the role "${role}", which is not a role`),
      ];
};

const labelFindings = (rule: Rule): readonly Finding[] => {
  const ruleTags = tagsOf(rule);

  return [
    ...(SLUG.test(rule.slug)
      ? []
      : [
          at(rule, 'is not a kebab-case slug'),
        ]),
    ...(rule.statement === ''
      ? [
          at(rule, 'has no statement'),
        ]
      : []),
    ...((rule.labels.why ?? '') === ''
      ? [
          at(rule, 'has no Why'),
        ]
      : []),
    ...checkFindings(rule),
    ...(ruleTags.length === 0
      ? [
          at(rule, 'has no Tags'),
        ]
      : []),
    ...ruleTags
      .filter((tag) => !tags.includes(tag))
      .map((tag) => at(rule, `has the tag "${tag}", which is not a lens`)),
  ];
};

const duplicateFindings = (rules: readonly Rule[]): readonly Finding[] =>
  rules.flatMap((rule, index) => {
    const first = rules.findIndex((candidate) => candidate.slug === rule.slug);

    return first === index
      ? []
      : [
          at(rule, `is also defined in ${rules[first]?.file ?? ''}`),
        ];
  });

const implementsFindings = (input: {
  byId: BlocksById;
  constitution: Constitution;
  rule: Rule;
}): readonly Finding[] => {
  const raw = input.rule.labels.implements ?? '';

  if (raw === '') {
    return [];
  }

  const slug = REFERENCE.exec(raw)?.[1] ?? raw;
  const target = input.constitution.rules.find((rule) => rule.slug === slug);

  if (target === undefined) {
    return [
      at(input.rule, `implements "${slug}", which is not a rule`),
    ];
  }

  const from = input.byId.get(input.rule.block);
  const file = from?.files.find(
    (candidate) => candidate.path === input.rule.file,
  );
  const isAllowed =
    from !== undefined &&
    file !== undefined &&
    mayReferTo({
      byId: input.byId,
      file,
      from,
      to: target.block,
    });

  return isAllowed
    ? []
    : [
        at(
          input.rule,
          `implements "${slug}" of ${target.block}, which its block may not refer to`,
        ),
      ];
};

const rulesCheck: Check = (constitution: Constitution): readonly Finding[] => {
  const byId = byIdOf(constitution.blocks);

  return [
    ...constitution.rules.flatMap(labelFindings),
    ...duplicateFindings(constitution.rules),
    ...constitution.strayHeadings.map((stray) => ({
      message: `heading "${stray.heading}" looks like a rule but is not "## <slug> · MUST|SHOULD|MAY"`,
      path: stray.file,
    })),
    ...constitution.rules.flatMap((rule) =>
      implementsFindings({
        byId,
        constitution,
        rule,
      }),
    ),
  ];
};

export { rulesCheck };
