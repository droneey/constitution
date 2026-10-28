import { Term } from '@droneey/constitution';
import type { Nodes, Strong, Text } from 'mdast';
import { visit } from 'unist-util-visit';

interface TermId {
  readonly id: string;
  readonly strong: Strong;
  readonly text: Text;
}

const idMarkOf = (id: string): string => `{#${id}}`;

const takeTermIds = (tree: Nodes): readonly TermId[] => {
  const termIds: TermId[] = [];

  visit(tree, 'strong', (strong, index, parent) => {
    // Stryker disable next-line ConditionalExpression,OptionalChaining: bold always has a parent and an index, so the checks only narrow their types
    const text = index === undefined ? undefined : parent?.children[index + 1];

    if (text?.type !== 'text') {
      return;
    }

    const id = Term.idAfter(text.value);

    if (id !== undefined) {
      text.value = text.value.slice(idMarkOf(id).length);
      termIds.push({
        id,
        strong,
        text,
      });
    }
  });

  return termIds;
};

export { idMarkOf, takeTermIds };
