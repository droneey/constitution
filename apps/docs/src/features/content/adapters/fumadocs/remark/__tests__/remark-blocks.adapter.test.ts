import { describe, expect, it } from 'bun:test';

import type { Root } from 'mdast';

import type { BlocksOptions } from '../remark-blocks.adapter';
import { remarkBlocks } from '../remark-blocks.adapter';
import {
  inlineCode,
  link,
  nodesOf,
  ruleTable,
  span,
  text,
  treeOf,
  withoutPositions,
} from './mdast.fixtures';
import {
  boxOf,
  cardOf,
  headingOf,
  markOf,
  metaOf,
  parentLineOf,
  whyOf,
} from './remark-blocks.adapter.fixtures';

const NO_OPTIONS: BlocksOptions = {
  addresses: new Map(),
  examples: new Map(),
};

const MUST = markOf({
  letter: 'M',
  level: 'MUST',
  mark: 'must',
});

const SHOULD = markOf({
  letter: 'S',
  level: 'SHOULD',
  mark: 'should',
});

const MAY = markOf({
  letter: 'Y',
  level: 'MAY',
  mark: 'may',
});

const levelOf = (level: string, mark: string): ReturnType<typeof span> =>
  span(
    {
      'data-rule-level': mark,
    },
    [
      text(level),
    ],
  );

const tagOf = (tag: string): ReturnType<typeof span> =>
  span(
    {
      'data-rule-tag': '',
    },
    [
      text(tag),
    ],
  );

describe('remarkBlocks', () => {
  it('should wrap a rule into a card of its level, tags, body and why when a block holds one', () => {
    // Arrange
    const tree: Root = {
      children: [
        ...nodesOf('### name-says-what · MUST\n\nA name says what it holds.'),
        ruleTable({
          tags: '[naming, clarity]',
          why: [
            text('a reader then knows.'),
          ],
        }),
        ...nodesOf('#### Deeper\n\nMore.\n\n## Other\n\nAfter.'),
      ],
      type: 'root',
    };

    // Act
    remarkBlocks(NO_OPTIONS)(tree);

    // Assert
    expect(tree).toStrictEqual({
      children: [
        cardOf([
          headingOf([
            MUST,
            levelOf('MUST', 'must'),
            inlineCode('name-says-what'),
            text(' [#name-says-what]'),
          ]),
          ...nodesOf('A name says what it holds.'),
          whyOf([
            text('A reader then knows.'),
          ]),
          ...nodesOf('#### Deeper\n\nMore.'),
          metaOf([
            tagOf('naming'),
            tagOf('clarity'),
          ]),
        ]),
        ...nodesOf('## Other\n\nAfter.'),
      ],
      type: 'root',
    });
  });

  it('should keep the why as written and show no tag when it opens with code and the rule has no tag', () => {
    // Arrange
    const tree: Root = {
      children: [
        ...nodesOf('### name-is-short · MAY'),
        ruleTable({
          tags: '[]',
          why: [
            inlineCode('x'),
            text(' is short.'),
          ],
        }),
      ],
      type: 'root',
    };

    // Act
    remarkBlocks(NO_OPTIONS)(tree);

    // Assert
    expect(tree).toStrictEqual({
      children: [
        cardOf([
          headingOf([
            MAY,
            levelOf('MAY', 'may'),
            inlineCode('name-is-short'),
            text(' [#name-is-short]'),
          ]),
          whyOf([
            inlineCode('x'),
            text(' is short.'),
          ]),
        ]),
      ],
      type: 'root',
    });
  });

  it('should show only the label of the why when the table has no row', () => {
    // Arrange
    const tree: Root = {
      children: [
        ...nodesOf('### name-is-short · SHOULD'),
        ruleTable(),
      ],
      type: 'root',
    };

    // Act
    remarkBlocks(NO_OPTIONS)(tree);

    // Assert
    expect(tree).toStrictEqual({
      children: [
        cardOf([
          headingOf([
            SHOULD,
            levelOf('SHOULD', 'should'),
            inlineCode('name-is-short'),
            text(' [#name-is-short]'),
          ]),
          whyOf([]),
        ]),
      ],
      type: 'root',
    });
  });

  it('should show only the label of the why when its row holds no cell', () => {
    // Arrange
    const tree: Root = {
      children: [
        ...nodesOf('### name-is-short · SHOULD'),
        {
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
        },
      ],
      type: 'root',
    };

    // Act
    remarkBlocks(NO_OPTIONS)(tree);

    // Assert
    expect(tree).toStrictEqual({
      children: [
        cardOf([
          headingOf([
            SHOULD,
            levelOf('SHOULD', 'should'),
            inlineCode('name-is-short'),
            text(' [#name-is-short]'),
          ]),
          whyOf([]),
        ]),
      ],
      type: 'root',
    });
  });

  it.each([
    {
      addresses: new Map([
        [
          'name-says-what',
          '/docs/core/names#name-says-what',
        ],
      ]),
      condition: 'the rule it tightens has an address',
      parent: link('/docs/core/names#name-says-what', [
        inlineCode('name-says-what'),
      ]),
    },
    {
      addresses: new Map(),
      condition: 'the rule it tightens has none',
      parent: inlineCode('name-says-what'),
    },
  ])('should name the rule a rule tightens when $condition', ({ addresses, parent }) => {
    // Arrange
    const tree = treeOf('### strict-name → name-says-what · SHOULD');

    // Act
    remarkBlocks({
      addresses,
      examples: new Map(),
    })(tree);

    // Assert
    expect(tree).toStrictEqual({
      children: [
        cardOf([
          headingOf([
            SHOULD,
            levelOf('SHOULD', 'should'),
            inlineCode('strict-name'),
            text(' [#strict-name]'),
          ]),
          parentLineOf([
            text('→ '),
            parent,
          ]),
        ]),
      ],
      type: 'root',
    });
  });

  it('should read the rule of a heading when its text carries marks and an image', () => {
    // Arrange
    const tree = treeOf('### **name-says-what**![mark](mark.png) · MUST');

    // Act
    remarkBlocks(NO_OPTIONS)(tree);

    // Assert
    expect(tree).toStrictEqual({
      children: [
        cardOf([
          headingOf([
            MUST,
            levelOf('MUST', 'must'),
            inlineCode('name-says-what'),
            text(' [#name-says-what]'),
          ]),
        ]),
      ],
      type: 'root',
    });
  });

  it('should end each rule at the next one when two rules follow each other', () => {
    // Arrange
    const tree = treeOf('### first-rule · MUST\n\nFirst.\n\n### second-rule · MAY\n\nSecond.');

    // Act
    remarkBlocks(NO_OPTIONS)(tree);

    // Assert
    expect(tree).toStrictEqual({
      children: [
        cardOf([
          headingOf([
            MUST,
            levelOf('MUST', 'must'),
            inlineCode('first-rule'),
            text(' [#first-rule]'),
          ]),
          ...nodesOf('First.'),
        ]),
        cardOf([
          headingOf([
            MAY,
            levelOf('MAY', 'may'),
            inlineCode('second-rule'),
            text(' [#second-rule]'),
          ]),
          ...nodesOf('Second.'),
        ]),
      ],
      type: 'root',
    });
  });

  it('should end a rule at the next heading of a rule depth when it names no rule', () => {
    // Arrange
    const tree = treeOf('Intro.\n\n### first-rule · MUST\n\nFirst.\n\n### Kinds\n\nPlain.');

    // Act
    remarkBlocks(NO_OPTIONS)(tree);

    // Assert
    expect(tree).toStrictEqual({
      children: [
        ...nodesOf('Intro.'),
        cardOf([
          headingOf([
            MUST,
            levelOf('MUST', 'must'),
            inlineCode('first-rule'),
            text(' [#first-rule]'),
          ]),
          ...nodesOf('First.'),
        ]),
        ...nodesOf('### Kinds\n\nPlain.'),
      ],
      type: 'root',
    });
  });

  it('should leave the headings of another depth when they read like rules', () => {
    // Arrange
    const tree = treeOf('## second-level · MUST\n\n#### fourth-level · MUST\n\nText.');

    // Act
    remarkBlocks(NO_OPTIONS)(tree);

    // Assert
    expect(tree).toStrictEqual(
      treeOf('## second-level · MUST\n\n#### fourth-level · MUST\n\nText.'),
    );
  });

  it('should drop the title and summary of the block when it opens with them', () => {
    // Arrange
    const tree = treeOf('# Names\n\n> Governs names.\n\nIntro.');

    // Act
    remarkBlocks(NO_OPTIONS)(tree);

    // Assert
    expect(tree).toStrictEqual(treeOf('Intro.'));
  });

  it('should link the slugs of known rules when the text names them outside links and headings', () => {
    // Arrange
    const tree = treeOf(
      '## About `name-says-what`\n\nAs `name-says-what` and `unknown-rule` say, [see `name-is-short`](names.md).\n\nname-says-what',
    );

    // Act
    remarkBlocks({
      addresses: new Map([
        [
          'name-says-what',
          '/docs/core/names#name-says-what',
        ],
        [
          'name-is-short',
          '/docs/core/names#name-is-short',
        ],
      ]),
      examples: new Map(),
    })(tree);

    // Assert
    expect(tree).toStrictEqual({
      children: [
        ...nodesOf('## About `name-says-what`'),
        {
          children: [
            text('As '),
            link('/docs/core/names#name-says-what', [
              inlineCode('name-says-what'),
            ]),
            text(' and '),
            inlineCode('unknown-rule'),
            text(' say, '),
            {
              children: [
                text('see '),
                inlineCode('name-is-short'),
              ],
              title: null,
              type: 'link',
              url: 'names.md',
            },
            text('.'),
          ],
          type: 'paragraph',
        },
        ...nodesOf('name-says-what'),
      ],
      type: 'root',
    });
  });

  it('should show an example of a pair side by side when its code is titled Avoid and Prefer', () => {
    // Arrange
    const tree = treeOf('### name-says-what · MUST');

    // Act
    remarkBlocks({
      addresses: new Map(),
      examples: new Map([
        [
          'name-says-what',
          '```ts title="Avoid"\nlet x;\n```\n\n```ts showLineNumbers title="Prefer" \nconst x = 1;\n```',
        ],
      ]),
    })(tree);

    // Assert
    expect(withoutPositions(tree)).toStrictEqual({
      children: [
        cardOf([
          headingOf([
            MUST,
            levelOf('MUST', 'must'),
            inlineCode('name-says-what'),
            text(' [#name-says-what]'),
          ]),
          boxOf(
            {
              'data-rule-example': 'pair',
            },
            [
              boxOf(
                {
                  'data-rule-example-column': 'avoid',
                },
                [
                  {
                    children: [
                      span(
                        {
                          'data-rule-example-label': '',
                        },
                        [
                          text('Avoid'),
                        ],
                      ),
                    ],
                    type: 'paragraph',
                  },
                  {
                    lang: 'ts',
                    meta: null,
                    type: 'code',
                    value: 'let x;',
                  },
                ],
              ),
              boxOf(
                {
                  'data-rule-example-column': 'prefer',
                },
                [
                  {
                    children: [
                      span(
                        {
                          'data-rule-example-label': '',
                        },
                        [
                          text('Prefer'),
                        ],
                      ),
                    ],
                    type: 'paragraph',
                  },
                  {
                    lang: 'ts',
                    meta: 'showLineNumbers',
                    type: 'code',
                    value: 'const x = 1;',
                  },
                ],
              ),
            ],
          ),
        ]),
      ],
      type: 'root',
    });
  });

  it('should show an example at full width when its code is not a pair', () => {
    // Arrange
    const tree = treeOf('### name-says-what · MUST');

    // Act
    remarkBlocks({
      addresses: new Map(),
      examples: new Map([
        [
          'name-says-what',
          '```ts title="Avoid"\nlet x;\n```\n\nThen:\n\n```ts title="Other"\nrun();\n```',
        ],
      ]),
    })(tree);

    // Assert
    expect(withoutPositions(tree)).toStrictEqual({
      children: [
        cardOf([
          headingOf([
            MUST,
            levelOf('MUST', 'must'),
            inlineCode('name-says-what'),
            text(' [#name-says-what]'),
          ]),
          boxOf(
            {
              'data-rule-example': '',
            },
            [
              boxOf(
                {
                  'data-rule-example-column': 'avoid',
                },
                [
                  {
                    children: [
                      span(
                        {
                          'data-rule-example-label': '',
                        },
                        [
                          text('Avoid'),
                        ],
                      ),
                    ],
                    type: 'paragraph',
                  },
                  {
                    lang: 'ts',
                    meta: null,
                    type: 'code',
                    value: 'let x;',
                  },
                ],
              ),
              ...nodesOf('Then:\n\n```ts title="Other"\nrun();\n```'),
            ],
          ),
        ]),
      ],
      type: 'root',
    });
  });

  it('should show an example at full width when it holds only the better code', () => {
    // Arrange
    const tree = treeOf('### name-says-what · MUST');

    // Act
    remarkBlocks({
      addresses: new Map(),
      examples: new Map([
        [
          'name-says-what',
          '```ts\nsetup();\n```\n\n```ts title="Prefer"\nconst x = 1;\n```',
        ],
      ]),
    })(tree);

    // Assert
    expect(withoutPositions(tree)).toStrictEqual({
      children: [
        cardOf([
          headingOf([
            MUST,
            levelOf('MUST', 'must'),
            inlineCode('name-says-what'),
            text(' [#name-says-what]'),
          ]),
          boxOf(
            {
              'data-rule-example': '',
            },
            [
              ...nodesOf('```ts\nsetup();\n```'),
              boxOf(
                {
                  'data-rule-example-column': 'prefer',
                },
                [
                  {
                    children: [
                      span(
                        {
                          'data-rule-example-label': '',
                        },
                        [
                          text('Prefer'),
                        ],
                      ),
                    ],
                    type: 'paragraph',
                  },
                  {
                    lang: 'ts',
                    meta: null,
                    type: 'code',
                    value: 'const x = 1;',
                  },
                ],
              ),
            ],
          ),
        ]),
      ],
      type: 'root',
    });
  });
});
