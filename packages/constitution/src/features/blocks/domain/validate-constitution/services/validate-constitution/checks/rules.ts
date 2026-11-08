import type { Axis, Level } from '#/kernel/constants';
import { Rule } from '#/kernel/entities';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import type { RuleSlug } from '#/kernel/value-objects';
import { BlockId } from '#/kernel/value-objects';

import { BlockGraph, mayReachAxis } from '../../../../block-graph/entities';
import { findingsAt } from '../../../utils';
import type { Check, CheckInput } from '../check.types';

enum RulesCode {
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
}

interface RulesDetails {
  readonly [RulesCode.WithoutStatement]: {
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.WithoutWhy]: {
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.DefinedTwice]: {
    readonly firstFile: string;
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.ParentNotRule]: {
    readonly parent: RuleSlug;
    readonly slug: RuleSlug;
  };
  readonly [RulesCode.ParentChainCycle]: {
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
}

type RulesFinding = FindingOf<RulesDetails>;

type RulesProblem = ProblemOf<RulesDetails>;

const fieldProblems = (rule: Rule): readonly (RulesProblem | undefined)[] => {
  const { slug } = rule;

  return [
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
    : placementProblem({
        graph: input.graph,
        parent,
        rule: input.rule,
        target,
      });
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

    return findingsAt(rule.file, problems);
  });
};

export type { RulesDetails };
export { RulesCode, rulesCheck };
