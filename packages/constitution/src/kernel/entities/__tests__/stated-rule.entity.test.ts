import { describe, expect, it } from 'bun:test';

import { findingOf } from '#/__tests__/finding.fixtures';

import { Axis, Level } from '../../constants';
import { ValueFailure } from '../../errors';
import type { Finding } from '../../types';
import { BlockId, coreBlockId, RuleSlug } from '../../value-objects';
import type { RuleSource } from '../stated-rule.entity';
import { StatedRule } from '../stated-rule.entity';

const FILE = 'blocks/core/foundation/principles.md';
const AGREEMENT = 'blocks/core/foundation/agreement.md';
const table = [
  '',
  '| Why | Tags |',
  '|---|---|',
  '| it keeps the code honest. | [] |',
];

const sourceOf = (lines: readonly string[]): RuleSource => ({
  axis: Axis.Foundation,
  block: coreBlockId,
  file: FILE,
  text: lines.join('\n'),
});

// A rule as "### a · MUST" states it, with the fields a case is about.
const ruleOf = (fields: Partial<StatedRule>): StatedRule => ({
  axis: Axis.Foundation,
  block: coreBlockId,
  file: FILE,
  slug: RuleSlug.create('a'),
  statedLevel: Level.Must,
  statement: 'A.',
  why: 'it keeps the code honest.',
  writtenLenses: [],
  ...fields,
});

// A rule whose heading states no level, as "### a → b" does.
const unstatedRuleOf = (fields: Partial<StatedRule>): StatedRule => ({
  axis: Axis.Foundation,
  block: coreBlockId,
  file: FILE,
  slug: RuleSlug.create('a'),
  statement: 'A.',
  why: 'it keeps the code honest.',
  writtenLenses: [],
  ...fields,
});

const found = (input: { code: string; names: readonly string[] }): Finding =>
  findingOf({
    code: input.code,
    names: input.names,
    path: FILE,
  });

describe('StatedRule.parse', () => {
  it('should read the heading, the statement and the table when a root rule is complete', () => {
    // Arrange
    const source = {
      ...sourceOf([
        '# Principles',
        '## Screens',
        '### four-data-states · MUST',
        'Every data view shows',
        '  four states.  ',
        '',
        '| Why | Tags |',
        '| :-: | --- |',
        '|  an empty screen cannot be told from a slow one. |  [ux,  a11y ] |',
        '',
        '**Example:**',
        'Prose after the example.',
      ]),
      axis: Axis.Architecture,
      file: 'blocks/core/architecture/with/ui.md',
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
          file: 'blocks/core/architecture/with/ui.md',
          seam: BlockId.create('ui'),
          section: 'Screens',
          slug: RuleSlug.create('four-data-states'),
          statement: 'Every data view shows four states.',
          why: 'an empty screen cannot be told from a slow one.',
          writtenLenses: [
            'ux',
            'a11y',
          ],
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
        ...table,
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

  it.each([
    {
      condition: 'its slug is not kebab-case',
      heading: '### Inputs_Labelled · MUST',
      names: [
        'Inputs_Labelled',
      ],
    },
    {
      condition: 'the slug it tightens is not kebab-case',
      heading: '### inputs-labelled → Focus_Shown · MUST',
      names: [
        'inputs-labelled',
        'Focus_Shown',
      ],
    },
  ])('should report the slug and read no rule when $condition', ({ heading, names }) => {
    // Arrange
    const source = sourceOf([
      heading,
      'A.',
      ...table,
    ]);

    // Act
    const parsed = StatedRule.parse(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [
        found({
          code: ValueFailure.RuleSlug,
          names,
        }),
      ],
      rules: [],
    });
  });

  it('should keep a pipe and a bold label in the statement when they sit inside a line', () => {
    // Arrange
    const source = sourceOf([
      '### a · MUST',
      'A rule names its reason after **Why:** and splits a | b.',
      ...table,
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
        found({
          code: 'rule-heading-misshapen',
          names: [
            heading,
          ],
        }),
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

  it.each<{
    findings: readonly Finding[];
    lines: readonly string[];
    name: string;
    rule: Partial<StatedRule>;
  }>([
    {
      findings: [
        found({
          code: 'rule-without-table',
          names: [
            'a',
          ],
        }),
      ],
      lines: [],
      name: 'no table',
      rule: {
        why: '',
      },
    },
    {
      findings: [
        found({
          code: 'rule-with-many-tables',
          names: [
            'a',
            '2',
          ],
        }),
      ],
      lines: [
        ...table,
        '',
        ...table,
      ],
      name: 'two tables',
      rule: {
        why: '',
      },
    },
    {
      findings: [
        found({
          code: 'rule-table-header-misshapen',
          names: [
            'a',
          ],
        }),
      ],
      lines: [
        '| Why | Check | Tags |',
        '|---|---|---|',
        '| it keeps the code honest. | [] |',
      ],
      name: 'the header of the old form',
      rule: {},
    },
    {
      findings: [
        found({
          code: 'rule-table-header-misshapen',
          names: [
            'a',
          ],
        }),
        found({
          code: 'rule-table-rows-not-one',
          names: [
            'a',
            '0',
          ],
        }),
      ],
      lines: [
        '| Why | Tags |',
        '| it keeps the code honest. | [] |',
      ],
      name: 'no delimiter row',
      rule: {
        why: '',
      },
    },
    {
      findings: [
        found({
          code: 'rule-table-rows-not-one',
          names: [
            'a',
            '2',
          ],
        }),
      ],
      lines: [
        ...table,
        '| it keeps the tests honest. | [] |',
      ],
      name: 'two rows',
      rule: {},
    },
    {
      findings: [
        found({
          code: 'rule-table-cells-miscounted',
          names: [
            'a',
            '1',
          ],
        }),
      ],
      lines: [
        '| Why | Tags |',
        '|---|---|',
        '| it keeps the code honest. |',
      ],
      name: 'a row of one cell',
      rule: {},
    },
    {
      findings: [],
      lines: [
        '| Why | Tags |',
        '|---|---|',
        '|  | [] |',
      ],
      name: 'an empty Why, which the rules check reports',
      rule: {
        why: '',
      },
    },
    {
      findings: [
        found({
          code: 'rule-tags-not-a-list',
          names: [
            'a',
            'ux, data',
          ],
        }),
      ],
      lines: [
        '| Why | Tags |',
        '|---|---|',
        '| it keeps the code honest. | ux, data |',
      ],
      name: 'Tags that are no list',
      rule: {},
    },
    {
      findings: [
        found({
          code: 'rule-table-header-misshapen',
          names: [
            'a',
          ],
        }),
      ],
      lines: [
        '| Why | Tags |',
        '| x- | --- |',
        '| it keeps the code honest. | [] |',
      ],
      name: 'a delimiter cell with a word before its dashes',
      rule: {},
    },
    {
      findings: [
        found({
          code: 'rule-table-header-misshapen',
          names: [
            'a',
          ],
        }),
      ],
      lines: [
        '| Why | Tags |',
        '| --- | -x |',
        '| it keeps the code honest. | [] |',
      ],
      name: 'a delimiter cell with a word after its dashes',
      rule: {},
    },
    {
      findings: [
        found({
          code: 'rule-tags-not-a-list',
          names: [
            'a',
            'see [ux]',
          ],
        }),
      ],
      lines: [
        '| Why | Tags |',
        '|---|---|',
        '| it keeps the code honest. | see [ux] |',
      ],
      name: 'Tags with a word before the list',
      rule: {},
    },
    {
      findings: [
        found({
          code: 'rule-tags-not-a-list',
          names: [
            'a',
            '[ux] too',
          ],
        }),
      ],
      lines: [
        '| Why | Tags |',
        '|---|---|',
        '| it keeps the code honest. | [ux] too |',
      ],
      name: 'Tags with a word after the list',
      rule: {},
    },
    {
      findings: [
        found({
          code: 'rule-holds-label',
          names: [
            'a',
            'Why',
          ],
        }),
        found({
          code: 'rule-holds-label',
          names: [
            'a',
            'Implements',
          ],
        }),
      ],
      lines: [
        '**Why:** it keeps the code honest.',
        ...table,
        '**Implements:** `b`',
      ],
      name: 'labels of the old form',
      rule: {},
    },
  ])(
    'should report the table and read what it can when a rule has $name',
    ({ findings, lines, rule }) => {
      // Arrange
      const source = sourceOf([
        '### a · MUST',
        'A.',
        ...lines,
      ]);

      // Act
      const parsed = StatedRule.parse(source);

      // Assert
      expect(parsed).toStrictEqual({
        findings,
        rules: [
          ruleOf(rule),
        ],
      });
    },
  );

  it('should read the rules of a chapter and report a heading that looks like a rule when the rules follow its title', () => {
    // Arrange
    const source = {
      ...sourceOf([
        '# Core',
        '### rules-bind · MUST',
        'The rules bind.',
        ...table,
        '### x - MUST',
      ]),
      file: AGREEMENT,
    };

    // Act
    const parsed = StatedRule.parse(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [
        findingOf({
          code: 'rule-heading-misshapen',
          names: [
            '### x - MUST',
          ],
          path: AGREEMENT,
        }),
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

describe('StatedRule.inheritLevels', () => {
  it('should bind a rule at the level its heading states and keep where and what it is', () => {
    // Arrange
    const stated = ruleOf({
      seam: BlockId.create('ui'),
      section: 'Screens',
      statedLevel: Level.Should,
      tightens: RuleSlug.create('b'),
      writtenLenses: [
        'ux',
      ],
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
        file: FILE,
        isLevelStated: true,
        level: Level.Should,
        seam: BlockId.create('ui'),
        section: 'Screens',
        slug: RuleSlug.create('a'),
        statement: 'A.',
        tightens: RuleSlug.create('b'),
        why: 'it keeps the code honest.',
        writtenLenses: [
          'ux',
        ],
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
