import type { Nodes, Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { visit } from 'unist-util-visit';

/** so a case can state the tree as written */
export const withoutPositions = <TNode extends Nodes>(tree: TNode): TNode => {
  visit(tree, (node) => {
    Reflect.deleteProperty(node, 'position');
  });

  return tree;
};

export const treeOf = (markdown: string): Root => withoutPositions(fromMarkdown(markdown));
