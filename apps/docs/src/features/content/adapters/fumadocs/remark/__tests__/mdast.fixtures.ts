import type { Emphasis, InlineCode, Link, Nodes, PhrasingContent, Root, Table, Text } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { visit } from 'unist-util-visit';

interface RuleTableRow {
  readonly tags: string;
  readonly why: PhrasingContent[];
}

/** so a case can state the tree as written */
export const withoutPositions = <TNode extends Nodes>(tree: TNode): TNode => {
  visit(tree, (node) => {
    Reflect.deleteProperty(node, 'position');
  });

  return tree;
};

export const treeOf = (markdown: string): Root => withoutPositions(fromMarkdown(markdown));

export const nodesOf = (markdown: string): Root['children'] => treeOf(markdown).children;

export const text = (words: string): Text => ({
  type: 'text',
  value: words,
});

export const inlineCode = (slug: string): InlineCode => ({
  type: 'inlineCode',
  value: slug,
});

/** without a title, as the plugin makes it */
export const link = (url: string, children: PhrasingContent[]): Link => ({
  children,
  type: 'link',
  url,
});

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

/** built by hand, since GitHub's tables need an extension the parser lacks */
export const ruleTable = (row?: RuleTableRow): Table => ({
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
