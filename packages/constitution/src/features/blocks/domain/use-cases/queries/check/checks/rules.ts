import { Layer, Lens } from '#/kernel/constants';
import { Rule } from '#/kernel/entities';
import type { Finding, Problem } from '#/kernel/types';
import type { RuleSlug } from '#/kernel/value-objects';
import { BlockId } from '#/kernel/value-objects';

import { BlockGraph } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { mayReachAxis } from '../shared/axes';

enum RulesCode {
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

const lenses: readonly string[] = Object.values(Lens);

const fieldProblems = (rule: Rule): readonly (Problem | undefined)[] => {
  const { slug } = rule;

  return [
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
    ...rule.writtenLenses
      .filter((lens) => !lenses.includes(lens))
      .map((lens) => ({
        code: RulesCode.TagNotLens,
        message: `rule "${slug}" has the tag "${lens}", which is not a lens`,
      })),
  ];
};

// Where the tightened rule sits and what level it gives, once it is a rule of another block outside
// any cycle.
const placementProblem = (input: {
  graph: BlockGraph;
  parent: RuleSlug;
  rule: Rule;
  target: Rule;
}): Problem | undefined => {
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
          message: `rule "${slug}" carries out "${parent}" of ${target.block}, which its block may not refer to`,
        }
      : {
          code: RulesCode.ParentSeamOutOfReach,
          message: `rule "${slug}" carries out "${parent}" of ${target.block} with ${target.seam}, which its place does not reach`,
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

  if (Rule.isLooserThan(rule, target)) {
    return {
      code: RulesCode.LooserThanParent,
      message: `rule "${slug}" is ${rule.level} while it carries out the ${target.level} rule "${parent}"; a rule is never looser than the rule it carries out`,
    };
  }

  return rule.isLevelStated
    ? undefined
    : {
        code: RulesCode.WithoutLevel,
        message: `rule "${slug}" carries out "${parent}" without a level; a rule that carries out another states its own, never looser than it`,
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
}): Problem | undefined => {
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
        message: `rule "${rule.slug}" sits in the chapter "${rule.chapterTitle ?? 'untitled'}" while it carries out "${target.slug}" of core's chapter "${target.chapterTitle ?? 'untitled'}"; a rule of a language or a platform that tightens core sits in the chapter titled like its parent's`,
      }
    : undefined;
};

const parentProblem = (input: {
  graph: BlockGraph;
  rule: Rule;
  slugs: ReadonlyMap<RuleSlug, Rule>;
}): Problem | undefined => {
  const { slug, tightens: parent } = input.rule;
  const target = Rule.tightenedIn(input.rule, input.slugs);
  const cycle = Rule.tighteningCycleOf(input.rule, input.slugs);

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

  return BlockId.equals(target.block, input.rule.block)
    ? {
        code: RulesCode.ParentInOwnBlock,
        message: `rule "${slug}" carries out "${parent}", a rule of its own block; a rule carries out only a rule of another block`,
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

const rulesCheck: Check = ({ graph, constitution }: CheckInput): readonly Finding[] => {
  const slugs = Rule.bySlug(constitution.rules);

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
        graph,
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
