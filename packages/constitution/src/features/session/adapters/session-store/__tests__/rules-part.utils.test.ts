import { describe, expect, it } from 'bun:test';

import { goldenFileText } from '#/__tests__/golden.fixtures';
import { Level } from '#/kernel/constants';
import { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import type { GatedRule } from '../../../domain/entities';
import { RuleHash } from '../../../domain/value-objects';
import { partIntroMessage, partTitleMessage, whyMessage } from '../rules-part.messages';
import { partRulesOf, partTextsOf } from '../rules-part.utils';

const NAMES_FILE = '/work/blocks/core/foundation/names.md';
const FUNCTIONS_FILE = '/work/blocks/core/foundation/functions.md';

const ruleOf = (
  input: Partial<GatedRule> & {
    index: number;
  },
): GatedRule => ({
  file: AbsolutePath.create(NAMES_FILE),
  hash: RuleHash.create(input.index.toString(16).padStart(16, '0')),
  level: Level.Must,
  slug: RuleSlug.create(`rule-${input.index}`),
  statement: 'A name reveals intent.',
  why: 'Readers learn from names.',
  ...input,
});

const headOf = (input: { count: number; number: number }): readonly string[] => [
  `# ${partTitleMessage(input)}`,
  '',
  partIntroMessage(),
  '',
];

const soleRulePartOf = (statementLines: readonly string[]): string =>
  [
    ...headOf({
      count: 1,
      number: 1,
    }),
    `## ${NAMES_FILE}`,
    '',
    '<!-- rule rule-1 0000000000000001 -->',
    '### rule-1 · MUST',
    '',
    ...statementLines,
    '',
    whyMessage('Readers learn from names.'),
    '',
  ].join('\n');

const goldenRules: readonly GatedRule[] = [
  ruleOf({
    index: 1,
  }),
  ruleOf({
    index: 2,
    tightens: RuleSlug.create('rule-1'),
  }),
  ruleOf({
    index: 3,
    lowered: {
      level: Level.May,
      reason: 'generated names',
    },
  }),
  ruleOf({
    index: 4,
    lowered: {
      level: Level.Should,
      reason: 'generated names',
      via: RuleSlug.create('generated-code'),
    },
  }),
  ruleOf({
    file: AbsolutePath.create(FUNCTIONS_FILE),
    index: 5,
    statement: 'A function does one thing.',
    why: 'One thing is read, named and tested at once.',
  }),
];

describe('partTextsOf', () => {
  it('should word and lay out a part, each rule under its file, at the level that binds here, as the golden file shows', async () => {
    // Act
    const [text = ''] = partTextsOf(goldenRules);

    // Assert
    expect(text).toBe(
      await goldenFileText(new URL('rules-part.golden.txt', import.meta.url), text),
    );
  });

  it.each([
    {
      condition: 'two words fill a line to its width exactly',
      expected: [
        `${'x'.repeat(199)} ${'y'.repeat(200)}`,
        'z',
      ],
      statement: `${'x'.repeat(199)} ${'y'.repeat(200)} z`,
    },
    {
      condition: 'its first word is as long as a line',
      expected: [
        'w'.repeat(400),
        'z',
      ],
      statement: `${'w'.repeat(400)} z`,
    },
  ])(
    'should break a statement at its spaces into lines of at most 400 characters when $condition',
    ({ expected, statement }) => {
      // Arrange
      const rules = [
        ruleOf({
          index: 1,
          statement,
        }),
      ];

      // Act
      const texts = partTextsOf(rules);

      // Assert
      expect(texts).toStrictEqual([
        soleRulePartOf(expected),
      ]);
    },
  );

  it('should give no part when no rule is to be read', () => {
    // Act
    const texts = partTextsOf([]);

    // Assert
    expect(texts).toStrictEqual([]);
  });

  it('should keep in one part a rule past the budget of a part on its own', () => {
    // Arrange
    const rules = [
      ruleOf({
        index: 1,
        statement: 'x'.repeat(70_000),
      }),
    ];

    // Act
    const texts = partTextsOf(rules);

    // Assert
    expect(texts).toStrictEqual([
      soleRulePartOf([
        'x'.repeat(70_000),
      ]),
    ]);
  });

  it('should open the next part, numbered, with the heading of the file of the rule that no longer fits', () => {
    // Arrange
    const rules = [
      ruleOf({
        index: 1,
        statement: 'x'.repeat(70_000),
      }),
      ruleOf({
        index: 2,
      }),
    ];

    // Act
    const [, second] = partTextsOf(rules);

    // Assert
    expect(second).toBe(
      [
        ...headOf({
          count: 2,
          number: 2,
        }),
        `## ${NAMES_FILE}`,
        '',
        '<!-- rule rule-2 0000000000000002 -->',
        '### rule-2 · MUST',
        '',
        'A name reveals intent.',
        '',
        whyMessage('Readers learn from names.'),
        '',
      ].join('\n'),
    );
  });

  it("should keep each rule's mark in order, none lost or repeated, when rules past one Read are split into parts", () => {
    // Arrange
    const rules = Array.from(
      {
        length: 400,
      },
      (_, index) =>
        ruleOf({
          index: index + 1,
          statement: 'word '.repeat(60).trim(),
        }),
    );

    // Act
    const texts = partTextsOf(rules);

    // Assert
    expect(texts.flatMap((text) => partRulesOf(text).rules)).toStrictEqual(
      rules.map((rule) => ({
        hash: rule.hash,
        slug: rule.slug,
      })),
    );
  });
});

describe('partRulesOf', () => {
  it('should read the rules a part marks, and leave out a mark of another form or one inside a line', () => {
    // Arrange
    const text = [
      '<!-- rule rule-1 0000000000000001 -->',
      '<!-- rule Rule-2 0000000000000002 -->',
      '<!-- rule rule-3 xyz -->',
      '<!-- rule rule-4 abc -->',
      '<!-- rule -rule-5- 0000000000000005 -->',
      'x<!-- rule rule-6 0000000000000006 -->',
      '<!-- rule rule-7 0000000000000007 -->x',
      'text',
    ].join('\n');

    // Act
    const part = partRulesOf(text);

    // Assert
    expect(part).toStrictEqual({
      lineCount: 8,
      rules: [
        {
          hash: RuleHash.create('0000000000000001'),
          slug: RuleSlug.create('rule-1'),
        },
      ],
    });
  });
});
