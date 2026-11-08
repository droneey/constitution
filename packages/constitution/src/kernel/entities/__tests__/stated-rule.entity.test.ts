import { describe, expect, it } from 'bun:test';

import { Axis, Level } from '../../constants';
import { ValueFailure } from '../../errors';
import { BlockId, coreBlockId, RuleSlug } from '../../value-objects';
import { RuleFormCode } from '../rule-form.entity';
import type { RuleSource, RulesParsed } from '../stated-rule.entity';
import { StatedRule } from '../stated-rule.entity';
import { ValueSite } from '../value-finding.entity';

const FILE = 'blocks/core/@foundation/principles.md';
const AGREEMENT = 'blocks/core/@foundation/agreement.md';
const sections = [
  '',
  '#### Why',
  '',
  'it keeps the code honest.',
  '',
  '#### Examples',
  '',
  '```sh title="Prefer"',
  '# a comment, not a heading',
  'run',
  '```',
];

const prefer = {
  code: '# a comment, not a heading\nrun',
  language: 'sh',
  title: 'Prefer',
};

const sourceOf = (lines: readonly string[]): RuleSource => ({
  axis: Axis.Foundation,
  block: coreBlockId,
  file: FILE,
  text: lines.join('\n'),
});

const ruleOf = (fields: Partial<StatedRule>): StatedRule => ({
  axis: Axis.Foundation,
  block: coreBlockId,
  examples: [
    prefer,
  ],
  file: FILE,
  slug: RuleSlug.create('a'),
  statedLevel: Level.Must,
  statement: 'A.',
  why: 'it keeps the code honest.',
  ...fields,
});

const unstatedRuleOf = (fields: Partial<StatedRule>): StatedRule => ({
  axis: Axis.Foundation,
  block: coreBlockId,
  examples: [
    prefer,
  ],
  file: FILE,
  slug: RuleSlug.create('a'),
  statement: 'A.',
  why: 'it keeps the code honest.',
  ...fields,
});

describe('StatedRule.parse', () => {
  it('should read the heading, the statement and the Why when a root rule is complete', () => {
    // Arrange
    const source = {
      ...sourceOf([
        '# Principles',
        '## Screens',
        '### four-data-states · MUST',
        'Every data view shows',
        '  four states.  ',
        '#### Why',
        '',
        '  An empty screen cannot be told',
        'from a slow one.',
        '',
        '#### Examples',
        '',
        '```sh title="Prefer"',
        '# a comment, not a heading',
        'run',
        '```',
      ]),
      axis: Axis.Architecture,
      file: 'blocks/core/@architecture/with/ui.md',
      seam: BlockId.create('ui'),
    };

    // Act
    const parsed = StatedRule.parse(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [],
      rules: [
        ruleOf({
          axis: Axis.Architecture,
          chapterTitle: 'Principles',
          file: 'blocks/core/@architecture/with/ui.md',
          seam: BlockId.create('ui'),
          section: 'Screens',
          slug: RuleSlug.create('four-data-states'),
          statement: 'Every data view shows four states.',
          why: 'An empty screen cannot be told from a slow one.',
        }),
      ],
    });
  });

  it.each<{
    heading: string;
    rule: StatedRule;
  }>([
    {
      heading: '### a · SHOULD',
      rule: ruleOf({
        statedLevel: Level.Should,
      }),
    },
    {
      heading: '### a → b',
      rule: unstatedRuleOf({
        tightens: RuleSlug.create('b'),
      }),
    },
    {
      heading: '### a → b · MAY',
      rule: ruleOf({
        statedLevel: Level.May,
        tightens: RuleSlug.create('b'),
      }),
    },
  ])(
    'should read the rule it tightens and the stated level when the heading is $heading',
    ({ heading, rule }) => {
      // Arrange
      const source = sourceOf([
        heading,
        'A.',
        ...sections,
      ]);

      // Act
      const parsed = StatedRule.parse(source);

      // Assert
      expect(parsed).toStrictEqual({
        findings: [],
        rules: [
          rule,
        ],
      });
    },
  );

  it.each<{
    condition: string;
    finding: RulesParsed['findings'][number];
    heading: string;
  }>([
    {
      condition: 'its slug is not kebab-case',
      finding: {
        code: ValueFailure.RuleSlug,
        details: {
          site: ValueSite.RuleHeading,
          written: 'Inputs_Labelled',
        },
        path: FILE,
      },
      heading: '### Inputs_Labelled · MUST',
    },
    {
      condition: 'the slug it tightens is not kebab-case',
      finding: {
        code: ValueFailure.RuleSlug,
        details: {
          rule: 'inputs-labelled',
          site: ValueSite.TightenedRule,
          written: 'Focus_Shown',
        },
        path: FILE,
      },
      heading: '### inputs-labelled → Focus_Shown · MUST',
    },
  ])('should report the slug and read no rule when $condition', ({ finding, heading }) => {
    // Arrange
    const source = sourceOf([
      heading,
      'A.',
      ...sections,
    ]);

    // Act
    const parsed = StatedRule.parse(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [
        finding,
      ],
      rules: [],
    });
  });

  it('should keep a pipe and a bold label in the statement when they sit inside a line', () => {
    // Arrange
    const source = sourceOf([
      '### a · MUST',
      'A rule names its reason after **Why:** and splits a | b.',
      ...sections,
    ]);

    // Act
    const parsed = StatedRule.parse(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [],
      rules: [
        ruleOf({
          statement: 'A rule names its reason after **Why:** and splits a | b.',
        }),
      ],
    });
  });

  it.each([
    '### x - MUST',
    '### x · MUST.',
    '# x · SHOULD',
    '## x · MUST',
    '#### x → y',
    '### x → y → z',
    '### x → ',
  ])('should report %p as a stray heading when it misses the rule heading forms', (heading) => {
    // Arrange
    const source = sourceOf([
      heading,
      'Text.',
    ]);

    // Act
    const parsed = StatedRule.parse(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [
        {
          code: RuleFormCode.HeadingMisshapen,
          details: {
            heading,
          },
          path: FILE,
        },
      ],
      rules: [],
    });
  });

  it.each([
    '## MUST, SHOULD and MAY in practice',
    '### levels · MUST in practice',
    '## Components',
    '### Components',
  ])('should neither read nor report the heading %p when it is no rule', (heading) => {
    // Arrange
    const source = sourceOf([
      heading,
      'Text.',
    ]);

    // Act
    const parsed = StatedRule.parse(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [],
      rules: [],
    });
  });

  it('should report each label the statement holds and end the statement at the first', () => {
    // Arrange
    const source = sourceOf([
      '### a · MUST',
      'A.',
      '**Example:** `b`',
      '**Implements:** `c`',
      ...sections,
    ]);

    // Act
    const parsed = StatedRule.parse(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [
        {
          code: RuleFormCode.HoldsLabel,
          details: {
            label: 'Example',
            slug: RuleSlug.create('a'),
          },
          path: FILE,
        },
        {
          code: RuleFormCode.HoldsLabel,
          details: {
            label: 'Implements',
            slug: RuleSlug.create('a'),
          },
          path: FILE,
        },
      ],
      rules: [
        ruleOf({}),
      ],
    });
  });

  it('should read the rules of a chapter and report a heading that looks like a rule when the rules follow its title', () => {
    // Arrange
    const source = {
      ...sourceOf([
        '# Core',
        '### rules-bind · MUST',
        'The rules bind.',
        ...sections,
        '### x - MUST',
      ]),
      file: AGREEMENT,
    };

    // Act
    const parsed = StatedRule.parse(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [
        {
          code: RuleFormCode.HeadingMisshapen,
          details: {
            heading: '### x - MUST',
          },
          path: AGREEMENT,
        },
      ],
      rules: [
        ruleOf({
          chapterTitle: 'Core',
          file: AGREEMENT,
          slug: RuleSlug.create('rules-bind'),
          statement: 'The rules bind.',
        }),
      ],
    });
  });
});

const levelsOf = (
  rules: readonly StatedRule[],
): readonly (readonly [
  string,
  Level,
  boolean,
])[] =>
  StatedRule.inheritLevels(rules).map((rule) => [
    rule.slug,
    rule.level,
    rule.isLevelStated,
  ]);

describe('StatedRule.wordingsOf', () => {
  it('should give the wording of each rule a text holds, without a place, past a heading of no rule and a misshapen rule', () => {
    // Arrange
    const text = [
      '# Principles',
      '## Screens',
      '### four-data-states · MUST',
      'Every data view shows four states.',
      ...sections,
      '### Not-A-Slug · MUST',
      'A misshapen slug.',
      ...sections,
      '### name-reveals-more → name-reveals-intent',
      'A name says more.',
      ...sections,
    ].join('\n');

    // Act
    const wordings = StatedRule.wordingsOf(text);

    // Assert
    expect(wordings).toStrictEqual([
      {
        examples: [
          prefer,
        ],
        slug: RuleSlug.create('four-data-states'),
        statedLevel: Level.Must,
        statement: 'Every data view shows four states.',
        why: 'it keeps the code honest.',
      },
      {
        examples: [
          prefer,
        ],
        slug: RuleSlug.create('name-reveals-more'),
        statement: 'A name says more.',
        tightens: RuleSlug.create('name-reveals-intent'),
        why: 'it keeps the code honest.',
      },
    ]);
  });
});

describe('StatedRule.retiredLevelsIn', () => {
  it('should report each rule whose heading states MAY, at its file, and pass the others', () => {
    // Arrange
    const stated = [
      ruleOf({
        slug: RuleSlug.create('a'),
        statedLevel: Level.May,
      }),
      ruleOf({
        slug: RuleSlug.create('b'),
        statedLevel: Level.Should,
      }),
      unstatedRuleOf({
        file: AGREEMENT,
        slug: RuleSlug.create('c'),
      }),
      ruleOf({
        file: AGREEMENT,
        slug: RuleSlug.create('d'),
        statedLevel: Level.May,
      }),
    ];

    // Act
    const findings = StatedRule.retiredLevelsIn(stated);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: RuleFormCode.LevelRetired,
        details: {
          slug: RuleSlug.create('a'),
        },
        path: FILE,
      },
      {
        code: RuleFormCode.LevelRetired,
        details: {
          slug: RuleSlug.create('d'),
        },
        path: AGREEMENT,
      },
    ]);
  });
});

describe('StatedRule.inheritLevels', () => {
  it('should bind a rule at the level its heading states and keep where and what it is', () => {
    // Arrange
    const stated = ruleOf({
      seam: BlockId.create('ui'),
      section: 'Screens',
      statedLevel: Level.Should,
      tightens: RuleSlug.create('b'),
    });

    // Act
    const rules = StatedRule.inheritLevels([
      stated,
    ]);

    // Assert
    expect(rules).toStrictEqual([
      {
        axis: Axis.Foundation,
        block: coreBlockId,
        examples: [
          prefer,
        ],
        file: FILE,
        isLevelStated: true,
        level: Level.Should,
        seam: BlockId.create('ui'),
        section: 'Screens',
        slug: RuleSlug.create('a'),
        statement: 'A.',
        tightens: RuleSlug.create('b'),
        why: 'it keeps the code honest.',
      },
    ]);
  });

  it('should take the level along the chain when two rules below a root state no level', () => {
    // Arrange
    const rules = [
      unstatedRuleOf({
        slug: RuleSlug.create('c'),
        tightens: RuleSlug.create('b'),
      }),
      unstatedRuleOf({
        slug: RuleSlug.create('b'),
        tightens: RuleSlug.create('a'),
      }),
      ruleOf({
        statedLevel: Level.Should,
      }),
    ];

    // Act
    const levels = levelsOf(rules);

    // Assert
    expect(levels).toStrictEqual([
      [
        'c',
        Level.Should,
        false,
      ],
      [
        'b',
        Level.Should,
        false,
      ],
      [
        'a',
        Level.Should,
        true,
      ],
    ]);
  });

  it('should keep a stated level and pass it down when a rule in the chain states a stricter one', () => {
    // Arrange
    const rules = [
      ruleOf({
        statedLevel: Level.May,
      }),
      ruleOf({
        slug: RuleSlug.create('b'),
        tightens: RuleSlug.create('a'),
      }),
      unstatedRuleOf({
        slug: RuleSlug.create('c'),
        tightens: RuleSlug.create('b'),
      }),
    ];

    // Act
    const levels = levelsOf(rules);

    // Assert
    expect(levels).toStrictEqual([
      [
        'a',
        Level.May,
        true,
      ],
      [
        'b',
        Level.Must,
        true,
      ],
      [
        'c',
        Level.Must,
        false,
      ],
    ]);
  });

  it('should bind a rule as MUST and stop at the break when the slug it tightens names no rule or its chain comes back to it', () => {
    // Arrange
    const rules = [
      unstatedRuleOf({
        tightens: RuleSlug.create('b'),
      }),
      unstatedRuleOf({
        slug: RuleSlug.create('b'),
        tightens: RuleSlug.create('a'),
      }),
      unstatedRuleOf({
        slug: RuleSlug.create('c'),
        tightens: RuleSlug.create('c'),
      }),
      unstatedRuleOf({
        slug: RuleSlug.create('d'),
        tightens: RuleSlug.create('gone'),
      }),
    ];

    // Act
    const levels = levelsOf(rules);

    // Assert
    expect(levels).toStrictEqual([
      [
        'a',
        Level.Must,
        false,
      ],
      [
        'b',
        Level.Must,
        false,
      ],
      [
        'c',
        Level.Must,
        false,
      ],
      [
        'd',
        Level.Must,
        false,
      ],
    ]);
  });

  it('should read the first rule of a slug when two rules share it', () => {
    // Arrange
    const rules = [
      unstatedRuleOf({
        tightens: RuleSlug.create('b'),
      }),
      ruleOf({
        slug: RuleSlug.create('b'),
        statedLevel: Level.Should,
      }),
      ruleOf({
        slug: RuleSlug.create('b'),
        statedLevel: Level.May,
      }),
    ];

    // Act
    const levels = levelsOf(rules);

    // Assert
    expect(levels[0]).toStrictEqual([
      'a',
      Level.Should,
      false,
    ]);
  });
});

describe('StatedRule.parse, a rule with its Why and Examples in sections', () => {
  it('should read the statement, the Why and the examples when the rule is complete', () => {
    // Arrange
    const source = sourceOf([
      '# Principles',
      '## Screens',
      '### a · MUST',
      'A.',
      ...sections,
      '### b · SHOULD',
      'B.',
      ...sections,
    ]);

    // Act
    const parsed = StatedRule.parse(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [],
      rules: [
        ruleOf({
          chapterTitle: 'Principles',
          section: 'Screens',
        }),
        ruleOf({
          chapterTitle: 'Principles',
          section: 'Screens',
          slug: RuleSlug.create('b'),
          statedLevel: Level.Should,
          statement: 'B.',
        }),
      ],
    });
  });

  it('should read the rules after a Vocabulary table and report a slug that is not kebab-case', () => {
    // Arrange
    const source = sourceOf([
      '## Vocabulary',
      '| Term | Meaning |',
      '|---|---|',
      '| a | b |',
      '### Bad_Slug · MUST',
      'X.',
      ...sections,
      '### a · MUST',
      'A.',
      ...sections,
      '### b · MUST',
      'B.',
      ...sections,
    ]);

    // Act
    const parsed = StatedRule.parse(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [
        {
          code: ValueFailure.RuleSlug,
          details: {
            site: ValueSite.RuleHeading,
            written: 'Bad_Slug',
          },
          path: FILE,
        },
      ],
      rules: [
        ruleOf({
          section: 'Vocabulary',
        }),
        ruleOf({
          section: 'Vocabulary',
          slug: RuleSlug.create('b'),
          statement: 'B.',
        }),
      ],
    });
  });

  it('should report a rule that holds neither section', () => {
    // Arrange
    const source = sourceOf([
      '### a · MUST',
      'A.',
      ...sections,
      '### b · MUST',
      'B.',
    ]);

    // Act
    const parsed = StatedRule.parse(source);

    // Assert
    expect(parsed.findings).toStrictEqual([
      {
        code: RuleFormCode.WithoutWhySection,
        details: {
          slug: RuleSlug.create('b'),
        },
        path: FILE,
      },
      {
        code: RuleFormCode.WithoutExamples,
        details: {
          slug: RuleSlug.create('b'),
        },
        path: FILE,
      },
    ]);
  });

  it('should hold a deeper heading under the rule above it and none under a section', () => {
    // Arrange
    const source = sourceOf([
      '## Screens',
      '#### x · MUST',
      '### a · MUST',
      'A.',
      ...sections,
      '####',
      '## Next ####',
      '### b · MUST',
      'B.',
      ...sections,
    ]);

    // Act
    const parsed = StatedRule.parse(source);

    // Assert
    expect(parsed.findings).toStrictEqual([
      {
        code: RuleFormCode.HeadingMisshapen,
        details: {
          heading: '#### x · MUST',
        },
        path: FILE,
      },
      {
        code: RuleFormCode.ExamplesNotLast,
        details: {
          slug: RuleSlug.create('a'),
        },
        path: FILE,
      },
      {
        code: RuleFormCode.SectionUnknown,
        details: {
          heading: '####',
          slug: RuleSlug.create('a'),
        },
        path: FILE,
      },
    ]);
  });

  it('should report a label its Why holds', () => {
    // Arrange
    const source = sourceOf([
      '### a · MUST',
      'A.',
      '#### Why',
      '**Note:** it keeps the code honest.',
      '#### Examples',
      '```sh title="Prefer"',
      'run',
      '```',
    ]);

    // Act
    const parsed = StatedRule.parse(source);

    // Assert
    expect(parsed.findings).toStrictEqual([
      {
        code: RuleFormCode.HoldsLabel,
        details: {
          label: 'Note',
          slug: RuleSlug.create('a'),
        },
        path: FILE,
      },
    ]);
  });

  it('should give the wording with its examples to a reader of the text alone', () => {
    // Arrange
    const text = [
      '### a · MUST',
      'A.',
      ...sections,
    ].join('\n');

    // Act
    const wordings = StatedRule.wordingsOf(text);

    // Assert
    expect(wordings).toStrictEqual([
      {
        examples: [
          prefer,
        ],
        slug: RuleSlug.create('a'),
        statedLevel: Level.Must,
        statement: 'A.',
        why: 'it keeps the code honest.',
      },
    ]);
  });
});
