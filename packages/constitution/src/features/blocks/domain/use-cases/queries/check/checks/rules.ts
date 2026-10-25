import type { Axis, Level } from '#/kernel/constants';
import { Layer } from '#/kernel/constants';
import { Rule } from '#/kernel/entities';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import type { RuleSlug } from '#/kernel/value-objects';
import { BlockId } from '#/kernel/value-objects';

import { BlockGraph, mayReachAxis } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

enum RulesCode {
  SlugOpensWithNo = 'slug-opens-with-no',
  WithoutStatement = 'rule-without-statement',
  WithoutWhy = 'rule-without-why',
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

interface RulesDetails {
  readonly [RulesCode.SlugOpensWithNo]: {
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.WithoutStatement]: {
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.WithoutWhy]: {
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.DefinedTwice]: {
    /** the file of the rule's first definition */
    readonly firstFile: string;
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.ParentNotRule]: {
    readonly parent: RuleSlug;
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.ParentChainCycle]: {
    /** the slugs of the chain, from the rule back to it */
    readonly cycle: readonly RuleSlug[];
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.ParentInOwnBlock]: {
    readonly parent: RuleSlug;
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.ParentOutOfReach]: {
    readonly parent: RuleSlug;
    readonly parentBlock: BlockId;
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.ParentSeamOutOfReach]: {
    readonly parent: RuleSlug;
    readonly parentBlock: BlockId;
    readonly parentSeam: BlockId;
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.ParentOffAxis]: {
    readonly axis: Axis;
    readonly parent: RuleSlug;
    readonly parentAxis: Axis;
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.LooserThanParent]: {
    readonly level: Level;
    readonly parent: RuleSlug;
    readonly parentLevel: Level;
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.WithoutLevel]: {
    readonly parent: RuleSlug;
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.OutsideParentChapter]: {
    /** the title of the rule's chapter, if it has one */
    readonly chapter?: string;
    readonly parent: RuleSlug;
    /** the title of the parent's chapter, if it has one */
    readonly parentChapter?: string;
    readonly slug: RuleSlug;
  };
}

type RulesFinding = FindingOf<RulesDetails>;

type RulesProblem = ProblemOf<RulesDetails>;

const fieldProblems = (rule: Rule): readonly (RulesProblem | undefined)[] => {
  const { slug } = rule;

  return [
    slug.startsWith('no-')
      ? {
          code: RulesCode.SlugOpensWithNo,
          details: {
            slug,
          },
        }
      : undefined,
    rule.statement === ''
      ? {
          code: RulesCode.WithoutStatement,
          details: {
            slug,
          },
        }
      : undefined,
    rule.why === ''
      ? {
          code: RulesCode.WithoutWhy,
          details: {
            slug,
          },
        }
      : undefined,
  ];
};

// Where the tightened rule sits and what level it gives, once it is a rule of another block outside
// any cycle.
const placementProblem = (input: {
  graph: BlockGraph;
  parent: RuleSlug;
  rule: Rule;
  target: Rule;
}): RulesProblem | undefined => {
  const { parent, rule, target } = input;
  const { slug } = rule;

  if (
    !BlockGraph.mayCarryOut(input.graph, {
      from: rule,
      to: target,
    })
  ) {
    return target.seam === undefined
      ? {
          code: RulesCode.ParentOutOfReach,
          details: {
            parent,
            parentBlock: target.block,
            slug,
          },
        }
      : {
          code: RulesCode.ParentSeamOutOfReach,
          details: {
            parent,
            parentBlock: target.block,
            parentSeam: target.seam,
            slug,
          },
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
      details: {
        axis: rule.axis,
        parent,
        parentAxis: target.axis,
        slug,
      },
    };
  }

  if (Rule.isLooserThan(rule, target)) {
    return {
      code: RulesCode.LooserThanParent,
      details: {
        level: rule.level,
        parent,
        parentLevel: target.level,
        slug,
      },
    };
  }

  return rule.isLevelStated
    ? undefined
    : {
        code: RulesCode.WithoutLevel,
        details: {
          parent,
          slug,
        },
      };
};

// A language or a platform names its chapters after core's, so a rule of one of its
// chapters that tightens a rule of core sits in the chapter titled like its parent's.
const MIRRORS_CORE: readonly Layer[] = [
  Layer.Language,
  Layer.Platform,
] as const;

const chapterProblem = (input: {
  graph: BlockGraph;
  rule: Rule;
  target: Rule;
}): RulesProblem | undefined => {
  const { rule, target } = input;
  // Stryker disable next-line OptionalChaining: every rule's block is in the index
  const layer = input.graph.get(rule.block)?.layer;
  // Stryker disable next-line OptionalChaining: every rule's block is in the index
  const isCoreParent = input.graph.get(target.block)?.layer === Layer.Core;

  return MIRRORS_CORE.some((mirror) => mirror === layer) &&
    rule.seam === undefined &&
    isCoreParent &&
    rule.chapterTitle !== target.chapterTitle
    ? {
        code: RulesCode.OutsideParentChapter,
        details: {
          ...(rule.chapterTitle === undefined
            ? {}
            : {
                chapter: rule.chapterTitle,
              }),
          parent: target.slug,
          ...(target.chapterTitle === undefined
            ? {}
            : {
                parentChapter: target.chapterTitle,
              }),
          slug: rule.slug,
        },
      }
    : undefined;
};

const parentProblem = (input: {
  graph: BlockGraph;
  rule: Rule;
  slugs: ReadonlyMap<RuleSlug, Rule>;
}): RulesProblem | undefined => {
  const { slug, tightens: parent } = input.rule;
  const target = Rule.tightenedIn(input.rule, input.slugs);
  const cycle = Rule.tighteningCycleOf(input.rule, input.slugs);

  if (parent === undefined) {
    return undefined;
  }

  if (target === undefined) {
    return {
      code: RulesCode.ParentNotRule,
      details: {
        parent,
        slug,
      },
    };
  }

  if (cycle !== undefined) {
    return {
      code: RulesCode.ParentChainCycle,
      details: {
        cycle,
        slug,
      },
    };
  }

  return BlockId.equals(target.block, input.rule.block)
    ? {
        code: RulesCode.ParentInOwnBlock,
        details: {
          parent,
          slug,
        },
      }
    : (placementProblem({
        graph: input.graph,
        parent,
        rule: input.rule,
        target,
      }) ??
        chapterProblem({
          graph: input.graph,
          rule: input.rule,
          target,
        }));
};

const rulesCheck: Check<RulesFinding> = ({
  graph,
  constitution,
}: CheckInput): readonly RulesFinding[] => {
  const slugs = Rule.bySlug(constitution.rules);

  return constitution.rules.flatMap((rule) => {
    const first = slugs.get(rule.slug) ?? rule;

    const problems: readonly (RulesProblem | undefined)[] = [
      ...fieldProblems(rule),
      first === rule
        ? undefined
        : {
            code: RulesCode.DefinedTwice,
            details: {
              firstFile: first.file,
              slug: rule.slug,
            },
          },
      parentProblem({
        graph,
        rule,
        slugs,
      }),
    ];

    return problems.flatMap((problem) =>
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

export type { RulesDetails };
export { RulesCode, rulesCheck };
