import type { Level } from '@droneey/constitution';
import { RuleHeading } from '@droneey/constitution';
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
} from 'mdast';
import { toString as mdastTextOf } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';

import {
  headingTextOf,
  isHeading,
  isSectionHeading,
  PART_HEADING_DEPTH,
  SUBSECTION_HEADING_DEPTH,
  textNode,
} from '../markdown';
import type { LevelLetters } from './remark-blocks.constants';
import {
  ExampleTone,
  exampleTonesByTitle,
  LEVEL_LETTERS,
  RulePart,
} from './remark-blocks.constants';
import { dropTitle } from './remark-drop-title.adapter';

interface BlocksOptions {
  addressesBySlug: ReadonlyMap<string, string>;
}

interface Box extends Parent {
  data: Data;
  type: 'box';
}

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

interface LevelledRule extends RuleHeading {
  readonly letter: string;
  readonly level: Level;
}

interface RuleSection {
  heading: Heading;
  rule: LevelledRule;
}

type Properties = Readonly<Record<string, string | string[]>>;

const linkTo = (address: string, child: PhrasingContent): Link => ({
  children: [
    child,
  ],
  type: 'link',
  url: address,
});

const part = (partName: string, partValue = ''): Properties => ({
  [`data-${partName}`]: partValue,
});

const span = (properties: Properties, children: PhrasingContent[]): PhrasingContent => ({
  children,
  data: {
    hName: 'span',
    hProperties: {
      ...properties,
    },
  },
  // Stryker disable next-line StringLiteral: mdast-util-to-hast renders a node by its data and children whatever its type, so the page is the same
  type: 'emphasis',
});

const paragraph = (properties: Properties, children: PhrasingContent[]): Paragraph => ({
  children,
  data: {
    hProperties: {
      ...properties,
    },
  },
  type: 'paragraph',
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
  // Stryker disable next-line StringLiteral: mdast-util-to-hast renders a node by its data and children whatever its type, so the page is the same
  type: 'box',
});

const levelLetters: LevelLetters = LEVEL_LETTERS;

const levelledRuleOf = (headingText: string): LevelledRule | undefined => {
  const rule = RuleHeading.of(headingText);

  if (rule?.level === undefined) {
    return;
  }

  const letter = levelLetters[rule.level];

  return letter === undefined
    ? undefined
    : {
        ...rule,
        letter,
        level: rule.level,
      };
};

const ruleSectionOf = (node: RootContent): RuleSection | undefined => {
  if (!isHeading(node, SUBSECTION_HEADING_DEPTH)) {
    return;
  }

  const rule = levelledRuleOf(
    mdastTextOf(node, {
      includeImageAlt: false,
    }),
  );

  return rule === undefined
    ? undefined
    : {
        heading: node,
        rule,
      };
};

const sectionEndOf = (children: readonly RootContent[], headingIndex: number): number => {
  const nextIndex = children.findIndex(
    (child, index) =>
      index > headingIndex && (isSectionHeading(child) || child.type === 'ruleCard'),
  );

  return nextIndex === -1 ? children.length : nextIndex;
};

const whyParagraphOf = (children: PhrasingContent[], isLabelled: boolean): Paragraph =>
  paragraph(part('rule-why'), [
    ...(isLabelled
      ? [
          span(part('rule-why-label'), [
            textNode('Why'),
          ]),
        ]
      : []),
    ...children,
  ]);

interface Column {
  node: RootContent;
  tone: ExampleTone | undefined;
}

const columnOf = (node: Code): Column => {
  // Stryker disable next-line StringLiteral: a code block without a meta has no title either way
  const meta = node.meta ?? '';
  // Stryker disable next-line StringLiteral: a code block without a title matches no tone either way
  const title = /title="([^"]+)"/.exec(meta)?.[1] ?? '';
  const tone = exampleTonesByTitle.get(title);

  return {
    node:
      tone === undefined
        ? node
        : box(part('rule-example-column', tone), [
            {
              children: [
                span(part('rule-example-label'), [
                  textNode(title),
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

const exampleOf = (nodes: readonly RootContent[]): Box => {
  const columns = nodes.map(
    (node): Column =>
      // Stryker disable next-line ConditionalExpression: only code has a meta to title it, so the type check only narrows the type
      node.type === 'code'
        ? columnOf(node)
        : {
            node,
            tone: undefined,
          },
  );
  const tones = new Set(columns.map(({ tone }) => tone));

  return box(
    part(
      'rule-example',
      tones.has(ExampleTone.Avoid) && tones.has(ExampleTone.Prefer) ? 'pair' : '',
    ),
    columns.map(({ node }) => node),
  );
};

const tightenedRuleLineOf = (tightens: string | undefined): Paragraph[] =>
  tightens === undefined
    ? []
    : [
        paragraph(part('rule-parent'), [
          textNode('→ '),
          code(tightens),
        ]),
      ];

const ruleHeadingOf = ({ heading, rule }: RuleSection): Heading => ({
  ...heading,
  children: [
    span(part('rule-mark', rule.level.toLowerCase()), [
      span(part('rule-mark-letter'), [
        textNode(rule.letter),
      ]),
      span(
        {
          className: [
            'sr-only',
          ],
        },
        [
          textNode(rule.level),
        ],
      ),
    ]),
    code(rule.slug),
    textNode(` [#${rule.slug}]`),
  ],
  data: {
    ...heading.data,
    hProperties: {
      ...heading.data?.hProperties,
      ...part('rule'),
    },
  },
});

interface BodyPart {
  readonly heading: Heading;
  readonly nodes: RootContent[];
}

interface Body {
  readonly lead: RootContent[];
  readonly parts: readonly BodyPart[];
}

const bodyOf = (nodes: readonly RootContent[]): Body => {
  const lead: RootContent[] = [];
  const parts: BodyPart[] = [];
  let open = lead;

  for (const node of nodes) {
    if (isHeading(node, PART_HEADING_DEPTH)) {
      open = [];
      parts.push({
        heading: node,
        nodes: open,
      });
    } else {
      open.push(node);
    }
  }

  return {
    lead,
    parts,
  };
};

const renderedPartOf = ({ heading, nodes }: BodyPart): RootContent[] => {
  const name = headingTextOf(heading);

  if (name === RulePart.Why) {
    return nodes.map((node, index) =>
      node.type === 'paragraph' ? whyParagraphOf(node.children, index === 0) : node,
    );
  }

  if (name === RulePart.Examples) {
    return [
      exampleOf(nodes),
    ];
  }

  return [
    heading,
    ...nodes,
  ];
};

const cardOf = (ruleSection: RuleSection, body: RootContent[]): RuleCard => {
  const { rule } = ruleSection;
  const { lead, parts } = bodyOf(body);

  return {
    children: [
      paragraph(part('rule-meta'), [
        span(part('rule-level', rule.level.toLowerCase()), [
          textNode(rule.level),
        ]),
      ]),
      ruleHeadingOf(ruleSection),
      ...tightenedRuleLineOf(rule.tightens),
      ...lead,
      ...parts.flatMap(renderedPartOf),
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

const wrapRules = (tree: Root): void => {
  // Why: from the last rule up, so a section ends at the card that follows it.
  for (const [index, node] of [
    ...tree.children.entries(),
  ].reverse()) {
    const ruleSection = ruleSectionOf(node);

    if (ruleSection !== undefined) {
      const endIndex = sectionEndOf(tree.children, index);
      const body = tree.children.slice(index + 1, endIndex);

      tree.children.splice(index, endIndex - index, cardOf(ruleSection, body));
    }
  }
};

const linkSlugs = (tree: Root, options: BlocksOptions): void => {
  visit(tree, 'inlineCode', (node, index, parent) => {
    const address = options.addressesBySlug.get(node.value);

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
    wrapRules(tree);
    linkSlugs(tree, options);
  };

export type { BlocksOptions };
export { levelledRuleOf, remarkBlocks };
