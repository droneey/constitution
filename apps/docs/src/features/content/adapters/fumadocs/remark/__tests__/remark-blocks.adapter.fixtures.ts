import type { Nodes, PhrasingContent, Root, RootContent, Table } from 'mdast';
import { toString as plainText } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';

import { nodesOf, span, text, withoutPositions } from './mdast.fixtures';

/** the mark before a rule's slug: its letter, and its level for a screen reader */
const markOf = (input: { letter: string; level: string; mark: string }): PhrasingContent =>
  span(
    {
      'data-rule-mark': input.mark,
    },
    [
      span(
        {
          'data-rule-mark-letter': '',
        },
        [
          text(input.letter),
        ],
      ),
      span(
        {
          className: [
            'sr-only',
          ],
        },
        [
          text(input.level),
        ],
      ),
    ],
  );

/** a rule's level, the first entry of its meta */
const levelOf = (input: { level: string; mark: string }): PhrasingContent =>
  span(
    {
      'data-rule-level': input.mark,
    },
    [
      text(input.level),
    ],
  );

/** one of a rule's tags, after its level */
const tagOf = (tag: string): PhrasingContent =>
  span(
    {
      'data-rule-tag': '',
    },
    [
      text(tag),
    ],
  );

/** the line of a rule's level and tags, opening its card */
const metaOf = (children: PhrasingContent[]): RootContent => ({
  children,
  data: {
    hProperties: {
      'data-rule-meta': '',
    },
  },
  type: 'paragraph',
});

/** a rule's heading as the plugin renders it */
const headingOf = (children: PhrasingContent[]): RootContent => ({
  children,
  data: {
    hProperties: {
      'data-rule': '',
    },
  },
  depth: 3,
  type: 'heading',
});

/** the line under a rule's heading that names the rule it tightens */
const parentLineOf = (children: PhrasingContent[]): RootContent => ({
  children,
  data: {
    hProperties: {
      'data-rule-parent': '',
    },
  },
  type: 'paragraph',
});

/** a rule's why, under its label */
const whyOf = (children: PhrasingContent[]): RootContent => ({
  children: [
    span(
      {
        'data-rule-why-label': '',
      },
      [
        text('Why'),
      ],
    ),
    ...children,
  ],
  data: {
    hProperties: {
      'data-rule-why': '',
    },
  },
  type: 'paragraph',
});

/** a rule's card */
const cardOf = (children: RootContent[]): RootContent => ({
  children,
  data: {
    hName: 'section',
    hProperties: {
      'data-rule-card': '',
    },
  },
  type: 'ruleCard',
});

/** a part of an example, a `div` marked by its attributes */
const boxOf = (
  attributes: Readonly<Record<string, string>>,
  children: RootContent[],
): RootContent => ({
  children,
  data: {
    hName: 'div',
    hProperties: {
      ...attributes,
    },
  },
  type: 'box',
});

/** a column of an example: the label of its tone above its code, written in Markdown */
const columnOf = (input: { code: string; title: string; tone: string }): RootContent =>
  boxOf(
    {
      'data-rule-example-column': input.tone,
    },
    [
      {
        children: [
          span(
            {
              'data-rule-example-label': '',
            },
            [
              text(input.title),
            ],
          ),
        ],
        type: 'paragraph',
      },
      ...nodesOf(input.code),
    ],
  );

/** a rule's table whose rows hold no cell */
const cellLessTable = (): Table => ({
  align: [],
  children: [
    {
      children: [],
      type: 'tableRow',
    },
    {
      children: [],
      type: 'tableRow',
    },
  ],
  type: 'table',
});

/** the value of a node's data attribute `data-<name>`, absent when the node is no such part */
const attributeOf = (node: Nodes, name: string): unknown =>
  node.data?.hProperties?.[`data-${name}`];

/** every part of a tree marked by `data-<name>`, in reading order, without positions */
const partsOf = (tree: Nodes, name: string): Nodes[] => {
  const parts: Nodes[] = [];

  visit(tree, (node) => {
    if (attributeOf(node, name) !== undefined) {
      parts.push(withoutPositions(node));
    }
  });

  return parts;
};

/** the first part of a tree marked by `data-<name>`, without positions */
const partOf = (tree: Nodes, name: string): Nodes | undefined => partsOf(tree, name)[0];

/** the text a reader sees in each node */
const textsOf = (nodes: readonly Nodes[]): readonly string[] =>
  nodes.map((node) => plainText(node));

/** the slug a card's heading names */
const slugOf = (card: Nodes): string => {
  const heading = partOf(card, 'rule');
  const slugs: string[] = [];

  if (heading !== undefined) {
    visit(heading, 'inlineCode', (node) => {
      slugs.push(node.value);
    });
  }

  return slugs.join('');
};

/** a node the author wrote, which the plugin marks as no part of a card */
const isAuthored = (node: RootContent): boolean =>
  Object.keys(node.data?.hProperties ?? {}).length === 0;

/** a card, by the rule it names and the text of what its author wrote under the heading */
interface CardOutline {
  readonly body: readonly string[];
  readonly rule: string;
}

/** the top of a tree: each card by its rule and body, every other node by its text */
const outlineOf = (tree: Root): ReadonlyArray<CardOutline | string> =>
  tree.children.map((node) =>
    node.type === 'ruleCard'
      ? {
          body: textsOf(node.children.filter(isAuthored)),
          rule: slugOf(node),
        }
      : plainText(node),
  );

/** a link by the text it shows and its address */
interface LinkOutline {
  readonly text: string;
  readonly url: string;
}

/** every link of a tree, in reading order */
const linksOf = (tree: Root): readonly LinkOutline[] => {
  const links: LinkOutline[] = [];

  visit(tree, 'link', (node) => {
    links.push({
      text: plainText(node),
      url: node.url,
    });
  });

  return links;
};

export {
  boxOf,
  cardOf,
  cellLessTable,
  columnOf,
  headingOf,
  levelOf,
  linksOf,
  markOf,
  metaOf,
  outlineOf,
  parentLineOf,
  partOf,
  partsOf,
  tagOf,
  textsOf,
  whyOf,
};
