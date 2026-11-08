import { describe, expect, it } from 'bun:test';

import { goldenFileText } from '#/__tests__/golden.fixtures';
import { Level } from '#/kernel/constants';
import { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import type { GatedDefinition, GatedRule, OwedReading } from '../../../domain/gate/entities';
import { RuleHash } from '../../../domain/gate/value-objects';
import {
  partIntroMessage,
  partTitleMessage,
  rulesHeadingMessage,
  vocabularyHeadingMessage,
} from '../rules-part.messages';
import { partRulesOf, partTextsOf } from '../rules-part.utils';

const namesFile = AbsolutePath.create('/work/blocks/core/foundation/names.md');
const functionsFile = AbsolutePath.create('/work/blocks/core/foundation/functions.md');

const ruleOf = (
  input: Partial<GatedRule> & {
    index: number;
  },
): GatedRule => ({
  file: namesFile,
  hash: RuleHash.create(input.index.toString(16).padStart(16, '0')),
  level: Level.Must,
  slug: RuleSlug.create(`rule-${input.index}`),
  statement: 'A name reveals intent.',
  why: 'Readers learn from names.',
  ...input,
});

const definitionOf = (
  input: Partial<GatedDefinition> & {
    index: number;
  },
): GatedDefinition => ({
  file: namesFile,
  hash: RuleHash.create(`a${input.index.toString(16).padStart(15, '0')}`),
  text: 'A **name** is what a thing is called.',
  ...input,
});

const rulesOnly = (rules: readonly GatedRule[]): OwedReading => ({
  definitions: [],
  rules,
});

const headOf = (input: { count: number; number: number }): readonly string[] => [
  `# ${partTitleMessage(input)}`,
  '',
  partIntroMessage(),
  '',
];

const mustHeading = `## ${rulesHeadingMessage({
  file: namesFile,
  level: Level.Must,
})}`;

const soleRulePartOf = (statementLines: readonly string[]): string =>
  [
    ...headOf({
      count: 1,
      number: 1,
    }),
    mustHeading,
    '',
    '<!-- rule rule-1 0000000000000001 -->',
    '### rule-1 · MUST',
    '',
    ...statementLines,
    '',
  ].join('\n');

const goldenReading: OwedReading = {
  definitions: [
    definitionOf({
      index: 1,
    }),
    definitionOf({
      index: 2,
      text: 'The tree:\n```text\nsrc/\n  names/\n```',
    }),
    definitionOf({
      file: functionsFile,
      index: 3,
      text: 'A **function** is code a caller runs by its name.',
    }),
  ],
  rules: [
    ruleOf({
      index: 1,
      level: Level.Should,
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
      file: functionsFile,
      index: 5,
      statement: 'A function does one thing.',
      why: 'One thing is read, named and tested at once.',
    }),
  ],
};

describe('partTextsOf', () => {
  it('should give the vocabularies first, then the statements at the level that binds here, MUST first and with no Why, as the golden file shows', async () => {
    // Act
    const [text = ''] = partTextsOf(goldenReading);

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
      const reading = rulesOnly([
        ruleOf({
          index: 1,
          statement,
        }),
      ]);

      // Act
      const texts = partTextsOf(reading);

      // Assert
      expect(texts).toStrictEqual([
        soleRulePartOf(expected),
      ]);
    },
  );

  it.each([
    {
      condition: 'a line is as long as a line may be',
      expected: [
        `  ${'x'.repeat(398)}`,
        '',
      ],
      text: `  ${'x'.repeat(398)}\n`,
    },
    {
      condition: 'a line is longer than a line may be',
      expected: [
        `${'x'.repeat(200)} ${'y'.repeat(199)}`,
        'z',
      ],
      text: `${'x'.repeat(200)} ${'y'.repeat(199)} z`,
    },
  ])(
    'should keep the lines of a definition as written, and break only a line past 400 characters, when $condition',
    ({ expected, text }) => {
      // Arrange
      const reading: OwedReading = {
        definitions: [
          definitionOf({
            index: 1,
            text,
          }),
        ],
        rules: [],
      };

      // Act
      const texts = partTextsOf(reading);

      // Assert
      expect(texts).toStrictEqual([
        [
          ...headOf({
            count: 1,
            number: 1,
          }),
          `## ${vocabularyHeadingMessage(namesFile)}`,
          '',
          '<!-- definition a000000000000001 -->',
          ...expected,
          '',
        ].join('\n'),
      ]);
    },
  );

  it('should give no part when nothing is to be read', () => {
    // Act
    const texts = partTextsOf(rulesOnly([]));

    // Assert
    expect(texts).toStrictEqual([]);
  });

  it('should keep in one part a rule past the budget of a part on its own', () => {
    // Arrange
    const reading = rulesOnly([
      ruleOf({
        index: 1,
        statement: 'x'.repeat(70_000),
      }),
    ]);

    // Act
    const texts = partTextsOf(reading);

    // Assert
    expect(texts).toStrictEqual([
      soleRulePartOf([
        'x'.repeat(70_000),
      ]),
    ]);
  });

  it('should open the next part, numbered, with the heading of the rule that no longer fits', () => {
    // Arrange
    const reading = rulesOnly([
      ruleOf({
        index: 1,
        statement: 'x'.repeat(70_000),
      }),
      ruleOf({
        index: 2,
      }),
    ]);

    // Act
    const [, second] = partTextsOf(reading);

    // Assert
    expect(second).toBe(
      [
        ...headOf({
          count: 2,
          number: 2,
        }),
        mustHeading,
        '',
        '<!-- rule rule-2 0000000000000002 -->',
        '### rule-2 · MUST',
        '',
        'A name reveals intent.',
        '',
      ].join('\n'),
    );
  });

  it("should keep each rule's and each definition's mark in order, none lost or repeated, when they are split into parts past one Read", () => {
    // Arrange
    const reading: OwedReading = {
      definitions: Array.from(
        {
          length: 300,
        },
        (_, index) =>
          definitionOf({
            index: index + 1,
            text: 'word '.repeat(60).trim(),
          }),
      ),
      rules: Array.from(
        {
          length: 400,
        },
        (_, index) =>
          ruleOf({
            index: index + 1,
            statement: 'word '.repeat(60).trim(),
          }),
      ),
    };

    // Act
    const parts = partTextsOf(reading).map(partRulesOf);

    // Assert
    expect({
      definitions: parts.flatMap((part) => part.definitions),
      rules: parts.flatMap((part) => part.rules),
    }).toStrictEqual({
      definitions: reading.definitions.map((definition) => definition.hash),
      rules: reading.rules.map((rule) => ({
        hash: rule.hash,
        slug: rule.slug,
      })),
    });
  });
});

describe('partRulesOf', () => {
  it('should read the rules and the definitions a part marks, and leave out a mark of another form or one inside a line', () => {
    // Arrange
    const text = [
      '<!-- rule rule-1 0000000000000001 -->',
      '<!-- rule Rule-2 0000000000000002 -->',
      '<!-- rule rule-3 xyz -->',
      '<!-- rule rule-4 abc -->',
      '<!-- rule -rule-5- 0000000000000005 -->',
      'x<!-- rule rule-6 0000000000000006 -->',
      '<!-- rule rule-7 0000000000000007 -->x',
      '<!-- definition 00000000000000a1 -->',
      '<!-- definition xyz -->',
      '<!-- definition abc -->',
      'x<!-- definition 00000000000000a2 -->',
      '<!-- definition 00000000000000a3 -->x',
      'text',
    ].join('\n');

    // Act
    const part = partRulesOf(text);

    // Assert
    expect(part).toStrictEqual({
      definitions: [
        RuleHash.create('00000000000000a1'),
      ],
      lineCount: 13,
      rules: [
        {
          hash: RuleHash.create('0000000000000001'),
          slug: RuleSlug.create('rule-1'),
        },
      ],
    });
  });
});
