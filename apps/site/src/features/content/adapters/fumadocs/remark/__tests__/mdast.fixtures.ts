import type { Emphasis, InlineCode, Link, Nodes, PhrasingContent, Root, Table, Text } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { visit } from 'unist-util-visit';

/** a tree without the positions the parser marks, so a case can state it as written */
export const withoutPositions = <TNode extends Nodes>(tree: TNode): TNode => {
  visit(tree, (node) => {
    Reflect.deleteProperty(node, 'position');
  });

  return tree;
};

/** a tree of Markdown, without positions */
export const treeOf = (markdown: string): Root => withoutPositions(fromMarkdown(markdown));

/** the children of a tree of Markdown, without positions */
export const nodesOf = (markdown: string): Root['children'] => treeOf(markdown).children;

export const text = (words: string): Text => ({
  type: 'text',
  value: words,
});

export const inlineCode = (slug: string): InlineCode => ({
  type: 'inlineCode',
  value: slug,
});

/** a link the plugin makes, which carries no title */
export const link = (url: string, children: PhrasingContent[]): Link => ({
  children,
  type: 'link',
  url,
});

/** a part of a rendered rule, a `span` marked by its attributes */
export const span = (
  attributes: Readonly<Record<string, string | string[]>>,
  children: PhrasingContent[],
): Emphasis => ({
  children,
  data: {
    hName: 'span',
    hProperties: {
      ...attributes,
    },
  },
  type: 'emphasis',
});

/** a rule's table, `| Why | Tags |`, with its row; GitHub's tables need an extension the parser lacks */
export const ruleTable = (row?: { tags: string; why: PhrasingContent[] }): Table => ({
  align: [
    null,
    null,
  ],
  children: [
    {
      children: [
        {
          children: [
            text('Why'),
          ],
          type: 'tableCell',
        },
        {
          children: [
            text('Tags'),
          ],
          type: 'tableCell',
        },
      ],
      type: 'tableRow',
    },
    ...(row === undefined
      ? []
      : [
          {
            children: [
              {
                children: row.why,
                type: 'tableCell' as const,
              },
              {
                children: [
                  text(row.tags),
                ],
                type: 'tableCell' as const,
              },
            ],
            type: 'tableRow' as const,
          },
        ]),
  ],
  type: 'table',
});
