import { Level } from '#/kernel/constants';

import type { Rule, StatedRule } from '../../../entities';

interface Inherited {
  level: Level | undefined;
  tags: readonly string[];
}

const firstBySlug = (rules: readonly StatedRule[]): ReadonlyMap<string, StatedRule> =>
  new Map(
    rules.toReversed().map((rule) => [
      rule.slug,
      rule,
    ]),
  );

const inheritedOf = (input: {
  bySlug: ReadonlyMap<string, StatedRule>;
  rule: StatedRule;
  seen: ReadonlySet<string>;
}): Inherited => {
  // Stryker disable next-line StringLiteral: no rule has an empty slug
  const parent = input.bySlug.get(input.rule.parent ?? '');
  const above =
    parent === undefined || input.seen.has(parent.slug)
      ? {
          level: undefined,
          tags: [],
        }
      : inheritedOf({
          bySlug: input.bySlug,
          rule: parent,
          seen: new Set([
            ...input.seen,
            parent.slug,
          ]),
        });

  return {
    level: input.rule.statedLevel ?? above.level,
    tags: [
      ...new Set([
        ...input.rule.ownTags,
        ...above.tags,
      ]),
    ],
  };
};

// A chain that never states a level, through a cycle or a missing parent,
// binds as MUST; the rules check reports the broken chain.
const resolveRules = (rules: readonly StatedRule[]): readonly Rule[] => {
  const bySlug = firstBySlug(rules);

  return rules.map((rule) => {
    const inherited = inheritedOf({
      bySlug,
      rule,
      seen: new Set(),
    });

    return {
      ...rule,
      level: inherited.level ?? Level.Must,
      tags: inherited.tags,
    };
  });
};

export { resolveRules };
