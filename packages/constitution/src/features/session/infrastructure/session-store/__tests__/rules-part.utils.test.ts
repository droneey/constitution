import { describe, expect, it } from 'bun:test';

import { goldenFileText } from '#/__tests__/golden.fixtures';
import { Level } from '#/kernel/constants';
import { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import type {
  GatedDefinition,
  GatedRule,
  MarkedReading,
  OwedReading,
} from '../../../domain/gate/entities';
import { RuleHash } from '../../../domain/gate/value-objects';
import {
  partIntroMessage,
  partTitleMessage,
  rulesHeadingMessage,
  vocabularyHeadingMessage,
  whyMessage,
} from '../rules-part.messages';
import { partsOf, readingTextOf } from '../rules-part.utils';

const projectFolderPath = AbsolutePath.create('/work');
const namesFile = AbsolutePath.create('/work/blocks/core/@foundation/names.md');
const SHOWN_NAMES_FILE = 'blocks/core/@foundation/names.md';
const functionsFile = AbsolutePath.create('/work/blocks/core/@foundation/functions.md');

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

const definitionHashOf = (index: number): RuleHash =>
  RuleHash.create(`a${index.toString(16).padStart(15, '0')}`);

const definitionOf = (
  input: Partial<GatedDefinition> & {
    index: number;
  },
): GatedDefinition => ({
  file: namesFile,
  hash: definitionHashOf(input.index),
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

const shownMustHeading = `## ${rulesHeadingMessage({
  file: SHOWN_NAMES_FILE,
  level: Level.Must,
})}`;

const SHOWN_RULE = /^### (rule-\d+) /gmu;
const SHOWN_DEFINITION = /^definition-(\d+) /gmu;

const listedOf = (list: MarkedReading) => ({
  definitions: list.definitions,
  rules: list.rules.map((rule) => rule.slug),
});

const shownIn = (text: string) => ({
  definitions: Array.from(text.matchAll(SHOWN_DEFINITION), (shown) =>
    definitionHashOf(Number(shown[1])),
  ),
  rules: Array.from(text.matchAll(SHOWN_RULE), (shown) => RuleSlug.create(shown[1] ?? '')),
});

const textsOf = (reading: OwedReading): readonly string[] =>
  partsOf({
    projectFolderPath,
    reading,
  }).map((part) => part.text);

const soleRulePartOf = (statementLines: readonly string[]): string =>
  [
    ...headOf({
      count: 1,
      number: 1,
    }),
    shownMustHeading,
    '',
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
    ruleOf({
      file: functionsFile,
      index: 6,
      isHeld: true,
      lowered: {
        level: Level.Should,
        reason: 'generated code',
      },
      statement: 'A function holds at most 100 lines.',
      tightens: RuleSlug.create('rule-5'),
    }),
  ],
};

describe('partsOf', () => {
  it('should give the vocabularies first, then the statements at the level that binds here, MUST first and with no Why, and a rule a tool holds as its heading alone, as the golden file shows', async () => {
    // Act
    const [text = ''] = textsOf(goldenReading);

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
      const texts = textsOf(reading);

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
      const texts = textsOf(reading);

      // Assert
      expect(texts).toStrictEqual([
        [
          ...headOf({
            count: 1,
            number: 1,
          }),
          `## ${vocabularyHeadingMessage(SHOWN_NAMES_FILE)}`,
          '',
          ...expected,
          '',
        ].join('\n'),
      ]);
    },
  );

  it('should give no part when nothing is to be read', () => {
    // Act
    const texts = textsOf(rulesOnly([]));

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
    const texts = textsOf(reading);

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
    const [, second] = textsOf(reading);

    // Assert
    expect(second).toBe(
      [
        ...headOf({
          count: 2,
          number: 2,
        }),
        shownMustHeading,
        '',
        '### rule-2 · MUST',
        '',
        'A name reveals intent.',
        '',
      ].join('\n'),
    );
  });

  it('should list with each part the rules and definitions its own text shows, in order, none lost or repeated, when they are split into parts past one Read', () => {
    // Arrange
    const reading: OwedReading = {
      definitions: Array.from(
        {
          length: 300,
        },
        (_, index) =>
          definitionOf({
            index: index + 1,
            text: `definition-${index + 1} ${'word '.repeat(60).trim()}`,
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
    const parts = partsOf({
      projectFolderPath,
      reading,
    });

    // Assert
    expect({
      definitions: parts.flatMap((part) => part.list.definitions),
      eachPart: parts.map((part) => listedOf(part.list)),
      isSplit: parts.length > 1,
      rules: parts.flatMap((part) => part.list.rules),
    }).toStrictEqual({
      definitions: reading.definitions.map((definition) => definition.hash),
      eachPart: parts.map((part) => shownIn(part.text)),
      isSplit: true,
      rules: reading.rules.map((rule) => ({
        hash: rule.hash,
        slug: rule.slug,
      })),
    });
  });

  it("should name a chapter by its whole path when it lies outside the project's folder", () => {
    // Arrange
    const outsideFile = AbsolutePath.create('/main/blocks/core/@foundation/names.md');
    const reading = rulesOnly([
      ruleOf({
        file: outsideFile,
        index: 1,
      }),
    ]);

    // Act
    const [text = ''] = textsOf(reading);

    // Assert
    expect(text.split('\n')).toContain(
      `## ${rulesHeadingMessage({
        file: outsideFile,
        level: Level.Must,
      })}`,
    );
  });
});

describe('readingTextOf', () => {
  it.each([
    {
      expected: [
        `## ${vocabularyHeadingMessage(namesFile)}`,
        '',
        'A **name** is what a thing is called.',
        '',
        mustHeading,
        '',
        '### rule-2 · MUST',
        '',
        'A name reveals intent.',
        '',
        `## ${rulesHeadingMessage({
          file: namesFile,
          level: Level.Should,
        })}`,
        '',
        '### rule-1 · SHOULD',
        '',
        'A name reveals intent.',
      ],
      withWhy: false,
    },
    {
      expected: [
        `## ${vocabularyHeadingMessage(namesFile)}`,
        '',
        'A **name** is what a thing is called.',
        '',
        mustHeading,
        '',
        '### rule-2 · MUST',
        '',
        'A name reveals intent.',
        '',
        whyMessage('Readers learn from names.'),
        '',
        `## ${rulesHeadingMessage({
          file: namesFile,
          level: Level.Should,
        })}`,
        '',
        '### rule-1 · SHOULD',
        '',
        'A name reveals intent.',
        '',
        whyMessage('Readers learn from names.'),
      ],
      withWhy: true,
    },
  ])(
    'should give the vocabularies, then the statements MUST first, unmarked and in one text, a rule a tool holds whole too, each with its Why $withWhy',
    ({ expected, withWhy }) => {
      // Arrange
      const reading: OwedReading = {
        definitions: [
          definitionOf({
            index: 1,
          }),
        ],
        rules: [
          ruleOf({
            index: 1,
            level: Level.Should,
          }),
          ruleOf({
            index: 2,
            isHeld: true,
          }),
        ],
      };

      // Act
      const text = readingTextOf({
        reading,
        withWhy,
      });

      // Assert
      expect<readonly string[]>(text.split('\n')).toStrictEqual(expected);
    },
  );

  it('should keep in one text what past the budget of a part would be split', () => {
    // Arrange
    const reading = rulesOnly(
      Array.from(
        {
          length: 400,
        },
        (_, index) =>
          ruleOf({
            index: index + 1,
            statement: 'word '.repeat(60).trim(),
          }),
      ),
    );

    // Act
    const text = readingTextOf({
      reading,
      withWhy: false,
    });

    // Assert
    expect(text.split('\n').filter((line) => line.startsWith('## '))).toStrictEqual([
      mustHeading,
    ]);
  });
});
