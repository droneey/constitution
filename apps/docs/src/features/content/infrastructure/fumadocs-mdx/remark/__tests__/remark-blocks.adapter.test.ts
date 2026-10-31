import { describe, expect, it } from 'bun:test';

import { goldenText } from '#/__tests__/golden.fixtures';

import type { BlocksOptions } from '../remark-blocks.adapter';
import { remarkBlocks } from '../remark-blocks.adapter';
import type { MarkdownVariant } from './html.fixtures';
import { htmlOfVariants } from './html.fixtures';
import { treeOf } from './mdast.fixtures';
import { codeMetasOf, linksOf, outlineOf } from './remark-blocks.adapter.fixtures';

const noOptions: BlocksOptions = {
  addressesBySlug: new Map(),
  examplesBySlug: new Map(),
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

const ruleCard = (markdown: string, example?: string): MarkdownVariant => ({
  markdown,
  plugins: [
    [
      remarkBlocks,
      {
        addressesBySlug: ruleAddresses,
        examplesBySlug: new Map(
          example === undefined
            ? []
            : [
                [
                  'name-says-what',
                  example,
                ],
              ],
        ),
      },
    ],
  ],
});

describe('remarkBlocks', () => {
  it('should render each rule as the card the golden file shows', async () => {
    // Arrange
    const variants = {
      'a MUST rule with every part, its why opening with a word': ruleCard(
        '### name-says-what → name-is-short · MUST\n\nA name says what it holds.\n\n| Why |\n|---|\n| a reader of `x` then knows. |\n',
        '```ts\nconst count = 1;\n```',
      ),
      'a MAY rule with only its heading': ruleCard('### name-is-short · MAY'),
      'a SHOULD rule that tightens a rule with no address': ruleCard(
        '### strict-name → unknown-rule · SHOULD',
      ),
      'a why that opens with code': ruleCard(
        '### name-says-what · MUST\n\n| Why |\n|---|\n| `x` is short. |\n',
      ),
      'a why with no row': ruleCard('### name-says-what · MUST\n\n| Why |\n|---|\n'),
      'an example whose code is titled Avoid and Prefer': ruleCard(
        '### name-says-what · MUST',
        '```ts title="Avoid"\nlet x;\n```\n\n```ts showLineNumbers title="Prefer" \nconst x = 1;\n```',
      ),
      'an example whose code is no pair': ruleCard(
        '### name-says-what · MUST',
        '```ts title="Avoid"\nlet x;\n```\n\nThen:\n\n```ts title="Other"\nrun();\n```',
      ),
      'an example of the better code alone': ruleCard(
        '### name-says-what · MUST',
        '```ts\nsetup();\n```\n\n```ts title="Prefer"\nconst x = 1;\n```',
      ),
    };

    // Act
    const html = htmlOfVariants(variants);

    // Assert
    expect(html).toBe(
      await goldenText(new URL('remark-blocks.adapter.golden.html', import.meta.url), html),
    );
  });

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
      addressesBySlug: ruleAddresses,
      examplesBySlug: new Map(),
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

  it('should take its title off the code of an example, keeping the rest of its meta', () => {
    // Arrange
    const tree = treeOf('### name-says-what · MUST');

    // Act
    remarkBlocks({
      addressesBySlug: new Map(),
      examplesBySlug: new Map([
        [
          'name-says-what',
          '```ts title="Avoid"\nlet x;\n```\n\n```ts showLineNumbers title="Prefer" \nconst x = 1;\n```\n\n```ts title="Other"\nrun();\n```',
        ],
      ]),
    })(tree);

    // Assert
    expect(codeMetasOf(tree)).toStrictEqual([
      null,
      'showLineNumbers',
      'title="Other"',
    ]);
  });
});
