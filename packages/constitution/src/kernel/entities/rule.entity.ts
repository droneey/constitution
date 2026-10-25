import type { Axis, Level } from '../constants';
import { LEVELS } from '../constants';
import type { BlockId } from '../value-objects';
import { RuleSlug } from '../value-objects';

interface RulePlace {
  readonly axis: Axis;
  readonly block: BlockId;
  readonly chapterTitle?: string;
  readonly file: string;
  readonly seam?: BlockId;
  readonly section?: string;
}

interface RuleText {
  readonly slug: RuleSlug;
  readonly statement: string;
  readonly tightens?: RuleSlug;
  readonly why: string;
  readonly writtenLenses: readonly string[];
}

interface Rule extends RulePlace, RuleText {
  readonly isLevelStated: boolean;
  readonly level: Level;
}

const create = (input: Rule): Rule => ({
  axis: input.axis,
  block: input.block,
  ...(input.chapterTitle === undefined
    ? {}
    : {
        chapterTitle: input.chapterTitle,
      }),
  file: input.file,
  isLevelStated: input.isLevelStated,
  level: input.level,
  ...(input.seam === undefined
    ? {}
    : {
        seam: input.seam,
      }),
  ...(input.section === undefined
    ? {}
    : {
        section: input.section,
      }),
  slug: input.slug,
  statement: input.statement,
  ...(input.tightens === undefined
    ? {}
    : {
        tightens: input.tightens,
      }),
  why: input.why,
  writtenLenses: input.writtenLenses,
});

/** The rules by slug; a slug written twice names the rule read first. */
const bySlug = <TRule extends RuleText>(rules: readonly TRule[]): ReadonlyMap<RuleSlug, TRule> =>
  new Map(
    rules.toReversed().map((rule) => [
      rule.slug,
      rule,
    ]),
  );

const sameAs = (rule: RuleText, other: RuleText): boolean => RuleSlug.equals(rule.slug, other.slug);

const tightenedIn = <TRule extends RuleText>(
  rule: RuleText,
  rules: ReadonlyMap<RuleSlug, TRule>,
): TRule | undefined =>
  // Stryker disable next-line ConditionalExpression: the test only narrows the type
  rule.tightens === undefined ? undefined : rules.get(rule.tightens);

/** The chain of slugs a rule tightens when it comes back to the rule, the rule's slug at both ends. */
const tighteningCycleOf = (
  rule: RuleText,
  rules: ReadonlyMap<RuleSlug, RuleText>,
): readonly RuleSlug[] | undefined => {
  const chain = [
    rule.slug,
  ];
  let next = tightenedIn(rule, rules);

  while (next !== undefined && !chain.includes(next.slug)) {
    chain.push(next.slug);
    next = tightenedIn(next, rules);
  }

  return next !== undefined && sameAs(next, rule)
    ? [
        ...chain,
        next.slug,
      ]
    : undefined;
};

const isLooserThan = (rule: Rule, other: Rule): boolean =>
  LEVELS.indexOf(rule.level) > LEVELS.indexOf(other.level);

const Rule = {
  bySlug,
  create,
  isLooserThan,
  sameAs,
  tightenedIn,
  tighteningCycleOf,
} as const;

export type { RulePlace, RuleText };
export { Rule };
