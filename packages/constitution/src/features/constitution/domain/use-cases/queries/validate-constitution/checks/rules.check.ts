import { Layer, LEVELS, Tag } from '#/kernel/constants';
import type { Finding, Problem } from '#/kernel/types';

import type { Rule } from '../../../../entities';
import type { BlocksById } from '../../../../utils';
import { mayCarryOut, mayReachAxis } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

enum RulesCode {
  SlugNotKebabCase = 'slug-not-kebab-case',
  SlugOpensWithNo = 'slug-opens-with-no',
  WithoutStatement = 'rule-without-statement',
  WithoutWhy = 'rule-without-why',
  TagNotLens = 'tag-not-a-lens',
  DefinedTwice = 'rule-defined-twice',
  ParentNotRule = 'parent-not-a-rule',
  ParentChainCycle = 'parent-chain-cycle',
  ParentInOwnBlock = 'parent-in-own-block',
  ParentOutOfReach = 'parent-out-of-reach',
  ParentSeamOutOfReach = 'parent-seam-out-of-reach',
  ParentOffAxis = 'parent-off-axis',
  LooserThanParent = 'rule-looser-than-parent',
  WithoutLevel = 'rule-without-level',
  OutsideParentChapter = 'rule-outside-parent-chapter',
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const tags: readonly string[] = Object.values(Tag);

const fieldProblems = (rule: Rule): readonly (Problem | undefined)[] => {
  const { slug } = rule;

  return [
    SLUG.test(slug)
      ? undefined
      : {
          code: RulesCode.SlugNotKebabCase,
          message: `rule "${slug}" is not a kebab-case slug`,
        },
    slug.startsWith('no-')
      ? {
          code: RulesCode.SlugOpensWithNo,
          message: `rule "${slug}" opens with "no-"; a slug says what holds`,
        }
      : undefined,
    rule.statement === ''
      ? {
          code: RulesCode.WithoutStatement,
          message: `rule "${slug}" has no statement`,
        }
      : undefined,
    rule.why === ''
      ? {
          code: RulesCode.WithoutWhy,
          message: `rule "${slug}" has no Why`,
        }
      : undefined,
    ...rule.ownTags
      .filter((tag) => !tags.includes(tag))
      .map((tag) => ({
        code: RulesCode.TagNotLens,
        message: `rule "${slug}" has the tag "${tag}", which is not a lens`,
      })),
  ];
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
const placementProblem = (input: {
  byId: BlocksById;
  parent: string;
  rule: Rule;
  target: Rule;
}): Problem | undefined => {
  const { parent, rule, target } = input;
  const { slug } = rule;

  if (
    !mayCarryOut({
      byId: input.byId,
      from: rule,
      to: target,
    })
  ) {
    return target.with === undefined
      ? {
          code: RulesCode.ParentOutOfReach,
          message: `rule "${slug}" carries out "${parent}" of ${target.block}, which its block may not refer to`,
        }
      : {
          code: RulesCode.ParentSeamOutOfReach,
          message: `rule "${slug}" carries out "${parent}" of ${target.block} with ${target.with}, which its place does not reach`,
        };
  }

  if (
    !mayReachAxis({
      from: rule.axis,
      to: target.axis,
    })
  ) {
    return {
      code: RulesCode.ParentOffAxis,
      message: `rule "${slug}" carries out "${parent}" on ${target.axis}, which a rule on ${rule.axis} may not refer to`,
    };
  }

  if (LEVELS.indexOf(rule.level) > LEVELS.indexOf(target.level)) {
    return {
      code: RulesCode.LooserThanParent,
      message: `rule "${slug}" is ${rule.level} while it carries out the ${target.level} rule "${parent}"; a rule is never looser than the rule it carries out`,
    };
  }

  return rule.statedLevel === undefined
    ? {
        code: RulesCode.WithoutLevel,
        message: `rule "${slug}" carries out "${parent}" without a level; a rule that carries out another states its own, never looser than it`,
      }
    : undefined;
};

// A language or a platform names its chapters after core's, so a rule of one of its
// chapters that tightens a rule of core sits in the chapter titled like its parent's.
const MIRRORS_CORE: readonly Layer[] = [
  Layer.Language,
  Layer.Platform,
];

const chapterProblem = (input: {
  byId: BlocksById;
  rule: Rule;
  target: Rule;
}): Problem | undefined => {
  const { rule, target } = input;
  // Stryker disable next-line OptionalChaining: every rule's block is in the index
  const layer = input.byId.get(rule.block)?.layer;
  // Stryker disable next-line OptionalChaining: every rule's block is in the index
  const isCoreParent = input.byId.get(target.block)?.layer === Layer.Core;

  return MIRRORS_CORE.some((mirror) => mirror === layer) &&
    rule.with === undefined &&
    isCoreParent &&
    rule.title !== target.title
    ? {
        code: RulesCode.OutsideParentChapter,
        message: `rule "${rule.slug}" sits in the chapter "${rule.title ?? 'untitled'}" while it carries out "${target.slug}" of core's chapter "${target.title ?? 'untitled'}"; a rule of a language or a platform that tightens core sits in the chapter titled like its parent's`,
      }
    : undefined;
};

const parentProblem = (input: {
  byId: BlocksById;
  rule: Rule;
  slugs: ReadonlyMap<string, Rule>;
}): Problem | undefined => {
  const { parent, slug } = input.rule;
  const target = parentOf(input);
  const cycle = cycleOf(input);

  if (parent === undefined) {
    return undefined;
  }

  if (target === undefined) {
    return {
      code: RulesCode.ParentNotRule,
      message: `rule "${slug}" carries out "${parent}", which is not a rule`,
    };
  }

  if (cycle !== undefined) {
    return {
      code: RulesCode.ParentChainCycle,
      message: `rule "${slug}" carries out a chain that comes back to it: ${cycle.join(' → ')}`,
    };
  }

  return target.block === input.rule.block
    ? {
        code: RulesCode.ParentInOwnBlock,
        message: `rule "${slug}" carries out "${parent}", a rule of its own block; a rule carries out only a rule of another block`,
      }
    : (placementProblem({
        byId: input.byId,
        parent,
        rule: input.rule,
        target,
      }) ??
        chapterProblem({
          byId: input.byId,
          rule: input.rule,
          target,
        }));
};

const rulesCheck: Check = ({ byId, constitution }: CheckInput): readonly Finding[] => {
  const slugs = firstBySlug(constitution.rules);

  return constitution.rules.flatMap((rule) => {
    const first = slugs.get(rule.slug) ?? rule;

    return [
      ...fieldProblems(rule),
      first === rule
        ? undefined
        : {
            code: RulesCode.DefinedTwice,
            message: `rule "${rule.slug}" is also defined in ${first.file}`,
          },
      parentProblem({
        byId,
        rule,
        slugs,
      }),
    ].flatMap((problem) =>
      problem === undefined
        ? []
        : [
            {
              ...problem,
              path: rule.file,
            },
          ],
    );
  });
};

export { rulesCheck };
