import { Layer } from '#/kernel/constants';
import type { Rule } from '#/kernel/entities';
import type { BlockId, RuleSlug } from '#/kernel/value-objects';

import { Block } from '../block/block.entity';
import type { BlockGraph } from '../block-graph/block-graph.entity';

interface RuleNamed {
  readonly block: BlockId;
  readonly slug: RuleSlug;
}

interface SimilarRules {
  readonly left: RuleNamed;
  readonly right: RuleNamed;
}

enum Kind {
  Core = 'core',
  Domain = 'domain',
  Context = 'context',
  Implementation = 'implementation',
}

const KIND_OF_LAYER = {
  [Layer.Core]: Kind.Core,
  [Layer.Domain]: Kind.Domain,
  [Layer.Implementation]: Kind.Implementation,
  [Layer.Language]: Kind.Context,
  [Layer.Platform]: Kind.Context,
} as const satisfies Readonly<Record<Layer, Kind>>;

const WORD = /[a-z]{3,}/g;
const SIMILAR = 0.5;

const wordsOf = (statement: string): ReadonlySet<string> =>
  new Set(statement.toLowerCase().match(WORD) ?? []);

const similarityOf = (input: { left: ReadonlySet<string>; right: ReadonlySet<string> }): number => {
  const shared = [
    ...input.left,
  ].filter((word) => input.right.has(word)).length;
  const all = new Set([
    ...input.left,
    ...input.right,
  ]).size;

  // Stryker disable next-line ConditionalExpression: 0 / 0 is NaN, also below SIMILAR
  return all === 0 ? 0 : shared / all;
};

const areSiblings = (input: { graph: BlockGraph; left: Rule; right: Rule }): boolean => {
  const left: Block | undefined = input.graph.get(input.left.block);
  const right: Block | undefined = input.graph.get(input.right.block);

  return (
    // Stryker disable next-line ConditionalExpression,LogicalOperator: every rule's block is in graph
    left !== undefined &&
    // Stryker disable next-line ConditionalExpression: every rule's block is in graph
    right !== undefined &&
    !Block.sameAs(left, right) &&
    KIND_OF_LAYER[left.layer] === KIND_OF_LAYER[right.layer]
  );
};

interface AmongInput {
  readonly graph: BlockGraph;
  readonly rules: readonly Rule[];
}

const among = (input: AmongInput): readonly SimilarRules[] => {
  const { rules } = input;
  const words = rules.map((rule) => wordsOf(rule.statement));

  return rules.flatMap((left, index) =>
    rules
      .slice(index + 1)
      .filter(
        (right, offset) =>
          areSiblings({
            graph: input.graph,
            left,
            right,
          }) &&
          similarityOf({
            left: words[index] ?? new Set(),
            right: words[index + 1 + offset] ?? new Set(),
          }) >= SIMILAR,
      )
      .map((right) => ({
        left: {
          block: left.block,
          slug: left.slug,
        },
        right: {
          block: right.block,
          slug: right.slug,
        },
      })),
  );
};

const SimilarRules = {
  among,
} as const;

export { SimilarRules };
