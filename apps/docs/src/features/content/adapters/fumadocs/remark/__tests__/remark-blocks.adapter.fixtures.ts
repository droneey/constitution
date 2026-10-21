import type { Nodes, PhrasingContent, Root, RootContent, Table } from 'mdast';
import { toString as plainText } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';

import { nodesOf, span, text, withoutPositions } from './mdast.fixtures';

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

const levelOf = (input: { level: string; mark: string }): PhrasingContent =>
  span(
    {
      'data-rule-level': input.mark,
    },
    [
      text(input.level),
    ],
  );

const tagOf = (tag: string): PhrasingContent =>
  span(
    {
      'data-rule-tag': '',
    },
    [
      text(tag),
    ],
  );

const metaOf = (children: PhrasingContent[]): RootContent => ({
  children,
  data: {
    hProperties: {
      'data-rule-meta': '',
    },
  },
  type: 'paragraph',
});

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

const parentLineOf = (children: PhrasingContent[]): RootContent => ({
  children,
  data: {
    hProperties: {
      'data-rule-parent': '',
    },
  },
  type: 'paragraph',
});

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

const attributeOf = (node: Nodes, name: string): unknown =>
  node.data?.hProperties?.[`data-${name}`];

/** in reading order, without positions */
const partsOf = (tree: Nodes, name: string): Nodes[] => {
  const parts: Nodes[] = [];

  visit(tree, (node) => {
    if (attributeOf(node, name) !== undefined) {
      parts.push(withoutPositions(node));
    }
  });

  return parts;
};

const partOf = (tree: Nodes, name: string): Nodes | undefined => partsOf(tree, name)[0];

const textsOf = (nodes: readonly Nodes[]): readonly string[] =>
  nodes.map((node) => plainText(node));

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

/** the plugin marks every part of a card, so a node without marks is the author's */
const isAuthored = (node: RootContent): boolean =>
  Object.keys(node.data?.hProperties ?? {}).length === 0;

interface CardOutline {
  readonly body: readonly string[];
  readonly rule: string;
}

const outlineOf = (tree: Root): ReadonlyArray<CardOutline | string> =>
  tree.children.map((node) =>
    node.type === 'ruleCard'
      ? {
          body: textsOf(node.children.filter(isAuthored)),
          rule: slugOf(node),
        }
      : plainText(node),
  );

interface LinkOutline {
  readonly text: string;
  readonly url: string;
}

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
