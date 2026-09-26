import type { Block, Rule } from '../../../entities';
import type { BlocksById } from '../../../utils';

const WORD = /[a-z]{3,}/g;
const SIMILAR = 0.5;

const wordsOf = (statement: string): ReadonlySet<string> =>
  new Set(statement.toLowerCase().match(WORD) ?? []);

const similarityOf = (input: {
  left: ReadonlySet<string>;
  right: ReadonlySet<string>;
}): number => {
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

const areSiblings = (input: {
  byId: BlocksById;
  left: Rule;
  right: Rule;
}): boolean => {
  const left: Block | undefined = input.byId.get(input.left.block);
  const right: Block | undefined = input.byId.get(input.right.block);

  return (
    // Stryker disable next-line ConditionalExpression,LogicalOperator: every rule's block is in byId
    left !== undefined &&
    // Stryker disable next-line ConditionalExpression: every rule's block is in byId
    right !== undefined &&
    left.id !== right.id &&
    left.frontMatter.kind === right.frontMatter.kind
  );
};

// Advice only: two blocks of one layer — one kind, so a platform and a language
// are siblings — saying nearly the same thing may share a rule that belongs one
// layer up; a person decides.
const similarRules = (input: {
  byId: BlocksById;
  rules: readonly Rule[];
}): readonly string[] => {
  const words = input.rules.map((rule) => wordsOf(rule.statement));

  return input.rules.flatMap((left, index) =>
    input.rules
      .slice(index + 1)
      .filter(
        (right, offset) =>
          areSiblings({
            byId: input.byId,
            left,
            right,
          }) &&
          similarityOf({
            left: words[index] ?? new Set(),
            right: words[index + 1 + offset] ?? new Set(),
          }) >= SIMILAR,
      )
      .map(
        (right) =>
          `similar rules: ${left.slug} (${left.block}) and ${right.slug} (${right.block})`,
      ),
  );
};

export { similarRules };
