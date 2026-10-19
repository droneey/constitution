import type {
  Code,
  Data,
  Heading,
  InlineCode,
  Link,
  Paragraph,
  Parent,
  PhrasingContent,
  Root,
  RootContent,
  Table,
} from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { visit } from 'unist-util-visit';

import type { Rule } from '../../../domain/entities';
import { Level } from '../../../domain/entities';
import { ruleOf } from '../../../domain/utils';
import { isHeading } from '../markdown';
import { dropTitle } from './remark-drop-title.adapter';

interface BlocksOptions {
  addresses: ReadonlyMap<string, string>;
  examples: ReadonlyMap<string, string>;
}

/** a part of a rule's card rendered as a `div`, marked by its data attribute */
interface Box extends Parent {
  data: Data;
  type: 'box';
}

/** a rule's card: its level and tags, its heading, its body and its example */
interface RuleCard extends Parent {
  data: Data;
  type: 'ruleCard';
}

declare module 'mdast' {
  interface RootContentMap {
    box: Box;
    ruleCard: RuleCard;
  }
}

interface RuleHeading {
  heading: Heading;
  rule: Rule;
}

type Properties = Readonly<Record<string, string | string[]>>;

const RULE_DEPTH = 3;

const LETTERS: Readonly<Record<Level, string>> = {
  [Level.May]: 'Y',
  [Level.Must]: 'M',
  [Level.Should]: 'S',
};

/** the tone of an example's column, by the title of its code */
const TONES: ReadonlyMap<string, string> = new Map([
  [
    'Avoid',
    'avoid',
  ],
  [
    'Prefer',
    'prefer',
  ],
]);

const textOf = (parent: Parent): string =>
  parent.children
    .map((child) => {
      if ('value' in child) {
        return child.value;
      }

      return 'children' in child ? textOf(child) : '';
    })
    .join('');

const linkTo = (address: string, child: PhrasingContent): Link => ({
  children: [
    child,
  ],
  type: 'link',
  url: address,
});

/** a part of the rendered rule, marked by its data attribute for the site's styles */
const part = (name: string, attribute = ''): Properties => ({
  [`data-${name}`]: attribute,
});

const span = (properties: Properties, children: PhrasingContent[]): PhrasingContent => ({
  children,
  data: {
    hName: 'span',
    hProperties: {
      ...properties,
    },
  },
  type: 'emphasis',
});

const text = (words: string): PhrasingContent => ({
  type: 'text',
  value: words,
});

const code = (slug: string): InlineCode => ({
  type: 'inlineCode',
  value: slug,
});

const box = (properties: Properties, children: RootContent[]): Box => ({
  children,
  data: {
    hName: 'div',
    hProperties: {
      ...properties,
    },
  },
  type: 'box',
});

/** the rule a third-level heading of the tree names */
const ruleHeadingOf = (node: RootContent): RuleHeading | undefined => {
  if (!isHeading(node, RULE_DEPTH)) {
    return undefined;
  }

  const rule = ruleOf(textOf(node));

  return rule === undefined
    ? undefined
    : {
        heading: node,
        rule,
      };
};

/** where a rule's section ends: at the next heading of its depth or above, or the next card */
const sectionEnd = (children: readonly RootContent[], from: number): number => {
  const next = children.findIndex(
    (child, index) =>
      index > from &&
      // Stryker disable next-line ConditionalExpression: only a heading has a depth, so checking its type only narrows it
      ((child.type === 'heading' && child.depth <= RULE_DEPTH) || child.type === 'ruleCard'),
  );

  return next === -1 ? children.length : next;
};

const capitalised = (children: PhrasingContent[]): PhrasingContent[] => {
  const [first, ...rest] = children;

  return first?.type === 'text'
    ? [
        text(first.value.charAt(0).toUpperCase() + first.value.slice(1)),
        ...rest,
      ]
    : children;
};

const tagNamesOf = (table: Table): string[] => {
  const tags = table.children[1]?.children[1];

  return tags === undefined
    ? []
    : textOf(tags)
        .replace(/[[\]]/g, '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
};

const whyOf = (table: Table): Paragraph => ({
  children: [
    span(part('rule-why-label'), [
      text('Why'),
    ]),
    ...capitalised(table.children[1]?.children[0]?.children ?? []),
  ],
  data: {
    hProperties: {
      ...part('rule-why'),
    },
  },
  type: 'paragraph',
});

/** an example's code block: a column of its tone when its title gives it one, else itself */
interface Column {
  column: RootContent;
  tone: string | undefined;
}

const columnOf = (node: Code): Column => {
  // Stryker disable next-line StringLiteral: a code block without a meta has no title either way
  const meta = node.meta ?? '';
  // Stryker disable next-line StringLiteral: a code block without a title matches no tone either way
  const title = /title="([^"]+)"/.exec(meta)?.[1] ?? '';
  const tone = TONES.get(title);

  return {
    column:
      tone === undefined
        ? node
        : box(part('rule-example-column', tone), [
            {
              children: [
                span(part('rule-example-label'), [
                  text(title),
                ]),
              ],
              type: 'paragraph',
            },
            {
              ...node,
              meta: meta.replace(/title="[^"]*"/, '').trim() || null,
            },
          ]),
    tone,
  };
};

// A pair titled Avoid and Prefer sits side by side; anything else is shown once, at full width.
const exampleOf = (markdown: string): Box => {
  const columns = fromMarkdown(markdown).children.map(
    (node): Column =>
      // Stryker disable next-line ConditionalExpression: only code has a meta to title it, so the type check only narrows the type
      node.type === 'code'
        ? columnOf(node)
        : {
            column: node,
            tone: undefined,
          },
  );
  const tones = new Set(columns.map(({ tone }) => tone));

  return box(
    part('rule-example', tones.has('avoid') && tones.has('prefer') ? 'pair' : ''),
    columns.map(({ column }) => column),
  );
};

/** the line under a rule's heading that names the rule it tightens, apart from the heading and its anchor; its slug is linked as every slug outside a heading is */
const parentLineOf = (parent: string | undefined): Paragraph[] =>
  parent === undefined
    ? []
    : [
        {
          children: [
            text('→ '),
            code(parent),
          ],
          data: {
            hProperties: {
              ...part('rule-parent'),
            },
          },
          type: 'paragraph',
        },
      ];

const cardOf = (
  { heading, rule }: RuleHeading,
  body: RootContent[],
  options: BlocksOptions,
): RuleCard => {
  const example = options.examples.get(rule.slug);
  const table = body.find((node) => node.type === 'table');
  const tags = table === undefined ? [] : tagNamesOf(table);
  // the level and the tags, a line of their own above the heading
  const meta: Paragraph = {
    children: [
      span(part('rule-level', rule.level.toLowerCase()), [
        text(rule.level),
      ]),
      ...tags.map((tag) =>
        span(part('rule-tag'), [
          text(tag),
        ]),
      ),
    ],
    data: {
      hProperties: {
        ...part('rule-meta'),
      },
    },
    type: 'paragraph',
  };

  return {
    children: [
      meta,
      heading,
      ...parentLineOf(rule.parent),
      ...body.map((node) => (node.type === 'table' ? whyOf(node) : node)),
      ...(example === undefined
        ? []
        : [
            exampleOf(example),
          ]),
    ],
    data: {
      hName: 'section',
      hProperties: {
        ...part('rule-card'),
      },
    },
    type: 'ruleCard',
  };
};

const wrapRules = (tree: Root, options: BlocksOptions): void => {
  // from the last rule up, so a section ends at the card that follows it
  for (const [index, node] of [
    ...tree.children.entries(),
  ].reverse()) {
    const ruleHeading = ruleHeadingOf(node);

    if (ruleHeading !== undefined) {
      const end = sectionEnd(tree.children, index);
      const body = tree.children.slice(index + 1, end);

      tree.children.splice(index, end - index, cardOf(ruleHeading, body, options));
    }
  }
};

const ruleHeading = (heading: Heading): void => {
  const rule = ruleOf(textOf(heading));

  if (rule === undefined) {
    return;
  }

  heading.data = {
    ...heading.data,
    hProperties: {
      ...heading.data?.hProperties,
      ...part('rule'),
    },
  };
  heading.children = [
    span(part('rule-mark', rule.level.toLowerCase()), [
      span(part('rule-mark-letter'), [
        text(LETTERS[rule.level]),
      ]),
      span(
        {
          className: [
            'sr-only',
          ],
        },
        [
          text(rule.level),
        ],
      ),
    ]),
    code(rule.slug),
    text(` [#${rule.slug}]`),
  ];
};

const linkSlugs = (tree: Root, options: BlocksOptions): void => {
  visit(tree, 'inlineCode', (node, index, parent) => {
    const address = options.addresses.get(node.value);

    if (
      address === undefined ||
      // Stryker disable next-line ConditionalExpression: inline code always has a parent, so the check only narrows its type
      parent === undefined ||
      // Stryker disable next-line ConditionalExpression: inline code always has an index, so the check only narrows its type
      index === undefined ||
      parent.type === 'link' ||
      parent.type === 'heading'
    ) {
      return;
    }
    parent.children.splice(index, 1, linkTo(address, node));
  });
};

const remarkBlocks =
  (options: BlocksOptions) =>
  (tree: Root): void => {
    dropTitle(tree);
    wrapRules(tree, options);
    linkSlugs(tree, options);
    // Stryker disable next-line StringLiteral: only a heading has a depth, so visiting every node finds the same ones
    visit(tree, 'heading', (heading) => {
      if (heading.depth === RULE_DEPTH) {
        ruleHeading(heading);
      }
    });
  };

export type { BlocksOptions };
export { remarkBlocks };
