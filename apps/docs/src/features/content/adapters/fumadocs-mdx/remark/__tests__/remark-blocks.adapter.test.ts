import { describe, expect, it } from 'bun:test';

import type { Root } from 'mdast';

import type { BlocksOptions } from '../remark-blocks.adapter';
import { remarkBlocks } from '../remark-blocks.adapter';
import { inlineCode, link, nodesOf, ruleTable, text, treeOf } from './mdast.fixtures';
import {
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
  whyOf,
} from './remark-blocks.adapter.fixtures';

const noOptions: BlocksOptions = {
  addresses: new Map(),
  examples: new Map(),
};

const ruleAddresses = new Map([
  [
    'name-says-what',
    '/docs/core/names#name-says-what',
  ],
  [
    'name-is-short',
    '/docs/core/names#name-is-short',
  ],
]);

const fullRule = (): Root => ({
  children: [
    ...nodesOf('### strict-name → name-says-what · MUST\n\nA name says what it holds.'),
    ruleTable({
      why: [
        text('a reader then knows.'),
      ],
    }),
  ],
  type: 'root',
});

const withExample = (markdown: string): BlocksOptions => ({
  addresses: new Map(),
  examples: new Map([
    [
      'name-says-what',
      markdown,
    ],
  ]),
});

describe('remarkBlocks', () => {
  it.each([
    {
      card: cardOf([
        metaOf([
          levelOf({
            level: 'MUST',
            mark: 'must',
          }),
        ]),
        headingOf([
          markOf({
            letter: 'M',
            level: 'MUST',
            mark: 'must',
          }),
          inlineCode('strict-name'),
          text(' [#strict-name]'),
        ]),
        parentLineOf([
          text('→ '),
          link('/docs/core/names#name-says-what', [
            inlineCode('name-says-what'),
          ]),
        ]),
        ...nodesOf('A name says what it holds.'),
        whyOf([
          text('A reader then knows.'),
        ]),
        boxOf(
          {
            'data-rule-example': '',
          },
          nodesOf('```ts\nconst count = 1;\n```'),
        ),
      ]),
      condition: 'the rule has every part',
      examples: new Map([
        [
          'strict-name',
          '```ts\nconst count = 1;\n```',
        ],
      ]),
      tree: fullRule(),
    },
    {
      card: cardOf([
        metaOf([
          levelOf({
            level: 'MAY',
            mark: 'may',
          }),
        ]),
        headingOf([
          markOf({
            letter: 'Y',
            level: 'MAY',
            mark: 'may',
          }),
          inlineCode('name-is-short'),
          text(' [#name-is-short]'),
        ]),
      ]),
      condition: 'the rule has only its heading',
      examples: new Map(),
      tree: treeOf('### name-is-short · MAY'),
    },
  ])(
    'should render a rule as a card of its parts in order when $condition',
    ({ card, examples, tree }) => {
      // Arrange
      const options = {
        addresses: ruleAddresses,
        examples,
      };

      // Act
      remarkBlocks(options)(tree);

      // Assert
      expect(partOf(tree, 'rule-card')).toStrictEqual(card);
    },
  );

  it.each([
    {
      heading: '### name-says-what · MUST',
      level: levelOf({
        level: 'MUST',
        mark: 'must',
      }),
      mark: markOf({
        letter: 'M',
        level: 'MUST',
        mark: 'must',
      }),
    },
    {
      heading: '### name-says-what · SHOULD',
      level: levelOf({
        level: 'SHOULD',
        mark: 'should',
      }),
      mark: markOf({
        letter: 'S',
        level: 'SHOULD',
        mark: 'should',
      }),
    },
    {
      heading: '### name-says-what · MAY',
      level: levelOf({
        level: 'MAY',
        mark: 'may',
      }),
      mark: markOf({
        letter: 'Y',
        level: 'MAY',
        mark: 'may',
      }),
    },
  ])(
    'should show the level in the meta and as the mark of the heading when a rule reads $heading',
    ({ heading, level, mark }) => {
      // Arrange
      const tree = treeOf(heading);

      // Act
      remarkBlocks(noOptions)(tree);

      // Assert
      expect([
        partOf(tree, 'rule-level'),
        partOf(tree, 'rule-mark'),
      ]).toStrictEqual([
        level,
        mark,
      ]);
    },
  );

  it.each([
    {
      condition: 'it opens with a word',
      table: ruleTable({
        why: [
          text('a reader of '),
          inlineCode('x'),
          text(' knows.'),
        ],
      }),
      why: whyOf([
        text('A reader of '),
        inlineCode('x'),
        text(' knows.'),
      ]),
    },
    {
      condition: 'it opens with code',
      table: ruleTable({
        why: [
          inlineCode('x'),
          text(' is short.'),
        ],
      }),
      why: whyOf([
        inlineCode('x'),
        text(' is short.'),
      ]),
    },
    {
      condition: 'the table has no row',
      table: ruleTable(),
      why: whyOf([]),
    },
    {
      condition: 'its row holds no cell',
      table: cellLessTable(),
      why: whyOf([]),
    },
  ])(
    'should show the why under its label, its first word capitalised, when $condition',
    ({ table, why }) => {
      // Arrange
      const tree: Root = {
        children: [
          ...nodesOf('### name-says-what · MUST'),
          table,
        ],
        type: 'root',
      };

      // Act
      remarkBlocks(noOptions)(tree);

      // Assert
      expect(partOf(tree, 'rule-why')).toStrictEqual(why);
    },
  );

  it.each([
    {
      condition: 'the rule it tightens has an address',
      heading: '### strict-name → name-says-what · SHOULD',
      line: parentLineOf([
        text('→ '),
        link('/docs/core/names#name-says-what', [
          inlineCode('name-says-what'),
        ]),
      ]),
    },
    {
      condition: 'the rule it tightens has none',
      heading: '### strict-name → unknown-rule · SHOULD',
      line: parentLineOf([
        text('→ '),
        inlineCode('unknown-rule'),
      ]),
    },
    {
      condition: 'the rule tightens none',
      heading: '### strict-name · SHOULD',
      line: undefined,
    },
  ])(
    'should name the rule a rule tightens on a line of its own when $condition',
    ({ heading, line }) => {
      // Arrange
      const tree = treeOf(heading);

      // Act
      remarkBlocks({
        addresses: ruleAddresses,
        examples: new Map(),
      })(tree);

      // Assert
      expect(partOf(tree, 'rule-parent')).toStrictEqual(line);
    },
  );

  it.each([
    {
      condition: 'two rules follow each other',
      markdown: '### first-rule · MUST\n\nFirst.\n\n### second-rule · MAY\n\nSecond.',
      outline: [
        {
          body: [
            'First.',
          ],
          rule: 'first-rule',
        },
        {
          body: [
            'Second.',
          ],
          rule: 'second-rule',
        },
      ],
    },
    {
      condition: 'a heading of a rule depth names no rule',
      markdown: 'Intro.\n\n### first-rule · MUST\n\nFirst.\n\n### Kinds\n\nPlain.',
      outline: [
        'Intro.',
        {
          body: [
            'First.',
          ],
          rule: 'first-rule',
        },
        'Kinds',
        'Plain.',
      ],
    },
    {
      condition: 'a deeper heading comes before a higher one',
      markdown: '### first-rule · MUST\n\nFirst.\n\n#### Deeper\n\nMore.\n\n## Other\n\nAfter.',
      outline: [
        {
          body: [
            'First.',
            'Deeper',
            'More.',
          ],
          rule: 'first-rule',
        },
        'Other',
        'After.',
      ],
    },
  ])(
    'should end a rule at the next heading of its depth or above when $condition',
    ({ markdown, outline }) => {
      // Arrange
      const tree = treeOf(markdown);

      // Act
      remarkBlocks(noOptions)(tree);

      // Assert
      expect(outlineOf(tree)).toStrictEqual(outline);
    },
  );

  it('should read the rule of a heading when its text carries marks and an image', () => {
    // Arrange
    const tree = treeOf('### **name-says-what**![mark](mark.png) · MUST');

    // Act
    remarkBlocks(noOptions)(tree);

    // Assert
    expect(outlineOf(tree)).toStrictEqual([
      {
        body: [],
        rule: 'name-says-what',
      },
    ]);
  });

  it('should leave the headings of another depth when they read like rules', () => {
    // Arrange
    const tree = treeOf('## second-level · MUST\n\n#### fourth-level · MUST\n\nText.');

    // Act
    remarkBlocks(noOptions)(tree);

    // Assert
    expect(tree).toStrictEqual(
      treeOf('## second-level · MUST\n\n#### fourth-level · MUST\n\nText.'),
    );
  });

  it('should drop the title and summary of the block when it opens with them', () => {
    // Arrange
    const tree = treeOf('# Names\n\n> Governs names.\n\nIntro.');

    // Act
    remarkBlocks(noOptions)(tree);

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
      addresses: ruleAddresses,
      examples: new Map(),
    })(tree);

    // Assert
    expect(linksOf(tree)).toStrictEqual([
      {
        text: 'name-says-what',
        url: '/docs/core/names#name-says-what',
      },
      {
        text: 'see name-is-short',
        url: 'names.md',
      },
    ]);
  });

  it.each([
    {
      condition: 'its code is titled Avoid and Prefer',
      example: boxOf(
        {
          'data-rule-example': 'pair',
        },
        [
          columnOf({
            code: '```ts\nlet x;\n```',
            title: 'Avoid',
            tone: 'avoid',
          }),
          columnOf({
            code: '```ts showLineNumbers\nconst x = 1;\n```',
            title: 'Prefer',
            tone: 'prefer',
          }),
        ],
      ),
      markdown:
        '```ts title="Avoid"\nlet x;\n```\n\n```ts showLineNumbers title="Prefer" \nconst x = 1;\n```',
    },
    {
      condition: 'its code is not a pair',
      example: boxOf(
        {
          'data-rule-example': '',
        },
        [
          columnOf({
            code: '```ts\nlet x;\n```',
            title: 'Avoid',
            tone: 'avoid',
          }),
          ...nodesOf('Then:\n\n```ts title="Other"\nrun();\n```'),
        ],
      ),
      markdown: '```ts title="Avoid"\nlet x;\n```\n\nThen:\n\n```ts title="Other"\nrun();\n```',
    },
    {
      condition: 'it holds only the better code',
      example: boxOf(
        {
          'data-rule-example': '',
        },
        [
          ...nodesOf('```ts\nsetup();\n```'),
          columnOf({
            code: '```ts\nconst x = 1;\n```',
            title: 'Prefer',
            tone: 'prefer',
          }),
        ],
      ),
      markdown: '```ts\nsetup();\n```\n\n```ts title="Prefer"\nconst x = 1;\n```',
    },
  ])(
    'should lay out an example by the titles of its code when $condition',
    ({ example, markdown }) => {
      // Arrange
      const tree = treeOf('### name-says-what · MUST');

      // Act
      remarkBlocks(withExample(markdown))(tree);

      // Assert
      expect(partOf(tree, 'rule-example')).toStrictEqual(example);
    },
  );
});
