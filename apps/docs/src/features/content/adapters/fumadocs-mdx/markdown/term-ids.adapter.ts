import { Term } from '@droneey/constitution';
import type { Nodes, Strong, Text } from 'mdast';
import { visit } from 'unist-util-visit';

interface TermId {
  readonly id: string;
  readonly strong: Strong;
  /** the text that held the id */
  readonly text: Text;
}

/** what the source writes for an id, `{#<id>}` */
const idMarkOf = (id: string): string => `{#${id}}`;

/** Takes the id written right after each bold term off the text, and gives each id with its bold. */
const takeTermIds = (tree: Nodes): readonly TermId[] => {
  const taken: TermId[] = [];

  visit(tree, 'strong', (strong, index, parent) => {
    // Stryker disable next-line ConditionalExpression,OptionalChaining: bold always has a parent and an index, so the checks only narrow their types
    const text = index === undefined ? undefined : parent?.children[index + 1];

    if (text?.type !== 'text') {
      return;
    }

    const id = Term.idAfter(text.value);

    if (id !== undefined) {
      text.value = text.value.slice(idMarkOf(id).length);
      taken.push({
        id,
        strong,
        text,
      });
    }
  });

  return taken;
};

export { idMarkOf, takeTermIds };
