import type { BlockContent, Code, Root } from 'mdast';
import { visit } from 'unist-util-visit';

const replaceFencedBlocks = (
  tree: Root,
  language: string,
  replacementOf: (code: Code) => BlockContent,
): void => {
  // Stryker disable next-line StringLiteral: only code has a language, so visiting every node finds the same ones
  visit(tree, 'code', (node, index, parent) => {
    if (
      node.lang !== language ||
      // Stryker disable next-line ConditionalExpression: a code node always has a parent, so the check only narrows its type
      parent === undefined ||
      // Stryker disable next-line ConditionalExpression: a code node always has an index, so the check only narrows its type
      index === undefined
    ) {
      return;
    }

    parent.children.splice(index, 1, replacementOf(node));
  });
};

export { replaceFencedBlocks };
