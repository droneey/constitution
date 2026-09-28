import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel';
import { Axis, Level } from '#/kernel';

import type { StatedRule } from '../../../../entities';
import { parseRules } from '../rules.utils';

const FILE = 'blocks/core/foundation/principles.md';
const CARD = 'blocks/core/core.md';
const HEADING_FORMS =
  '"## <slug> · <LEVEL>", "## <slug> → <parent>" or "## <slug> → <parent> · <LEVEL>"';
const TABLE = [
  '',
  '| Why | Check | Tags |',
  '|---|---|---|',
  '| it keeps the code honest. | review | [] |',
];

const sourceOf = (
  lines: readonly string[],
): {
  axis: Axis | undefined;
  block: string;
  file: string;
  text: string;
  with: string | undefined;
} => ({
  axis: Axis.Foundation,
  block: 'core',
  file: FILE,
  text: lines.join('\n'),
  with: undefined,
});

const ruleOf = (fields: Partial<StatedRule>): StatedRule => ({
  axis: Axis.Foundation,
  block: 'core',
  check: 'review',
  file: FILE,
  ownTags: [],
  parent: undefined,
  slug: 'a',
  statedLevel: Level.Must,
  statement: 'A.',
  why: 'it keeps the code honest.',
  with: undefined,
  ...fields,
});

const found = (message: string): Finding => ({
  message,
  path: FILE,
});

describe('parseRules', () => {
  it('should read the heading, the statement and the table when a root rule is complete', () => {
    // Arrange
    const source = {
      ...sourceOf([
        '# Principles',
        '## four-data-states · MUST',
        'Every data view shows',
        '  four states.  ',
        '',
        '| Why | Check | Tags |',
        '| --- | :-: | --- |',
        '|  an empty screen cannot be told from a slow one. | test |  [ux,  a11y ] |',
        '',
        '**Example:**',
        'Prose after the example.',
      ]),
      axis: Axis.Architecture,
      file: 'blocks/core/architecture/with/ui.md',
      with: 'ui',
    };

    // Act
    const parsed = parseRules(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [],
      rules: [
        ruleOf({
          axis: Axis.Architecture,
          check: 'test',
          file: 'blocks/core/architecture/with/ui.md',
          ownTags: [
            'ux',
            'a11y',
          ],
          slug: 'four-data-states',
          statement: 'Every data view shows four states.',
          why: 'an empty screen cannot be told from a slow one.',
          with: 'ui',
        }),
      ],
    });
  });

  it.each<{
    heading: string;
    level: Level | undefined;
    parent: string | undefined;
  }>([
    {
      heading: '## a · SHOULD',
      level: Level.Should,
      parent: undefined,
    },
    {
      heading: '## a → b',
      level: undefined,
      parent: 'b',
    },
    {
      heading: '## a → b · MAY',
      level: Level.May,
      parent: 'b',
    },
  ])(
    'should read the parent and the stated level when the heading is $heading',
    ({ heading, level, parent }) => {
      // Arrange
      const source = sourceOf([
        heading,
        'A.',
        ...TABLE,
      ]);

      // Act
      const parsed = parseRules(source);

      // Assert
      expect(parsed).toStrictEqual({
        findings: [],
        rules: [
          ruleOf({
            parent,
            statedLevel: level,
          }),
        ],
      });
    },
  );

  it('should keep a pipe and a bold label in the statement when they sit inside a line', () => {
    // Arrange
    const source = sourceOf([
      '## a · MUST',
      'A rule names its reason after **Why:** and splits a | b.',
      ...TABLE,
    ]);

    // Act
    const parsed = parseRules(source);

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

  it('should end each rule at the next heading when headings of several levels follow one another', () => {
    // Arrange
    const source = sourceOf([
      '## a · SHOULD',
      'A.',
      ...TABLE,
      '### Notes',
      'Text.',
      '## c · MAY',
      'C.',
      ...TABLE,
    ]);

    // Act
    const parsed = parseRules(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [],
      rules: [
        ruleOf({
          statedLevel: Level.Should,
        }),
        ruleOf({
          slug: 'c',
          statedLevel: Level.May,
          statement: 'C.',
        }),
      ],
    });
  });

  it.each([
    '## x - MUST',
    '## x · MUST.',
    '# x · SHOULD',
    '## x → y → z',
    '## x → y · MOST',
    '## x → ',
  ])(
    'should report %p as a stray heading when it misses the rule heading forms',
    (heading) => {
      // Arrange
      const source = sourceOf([
        heading,
        'Text.',
      ]);

      // Act
      const parsed = parseRules(source);

      // Assert
      expect(parsed).toStrictEqual({
        findings: [
          found(
            `heading "${heading}" looks like a rule but is not ${HEADING_FORMS}`,
          ),
        ],
        rules: [],
      });
    },
  );

  it.each([
    '## MUST, SHOULD and MAY in practice',
    '## levels · MUST in practice',
    '## Components',
  ])(
    'should neither read nor report the heading %p when it is no rule',
    (heading) => {
      // Arrange
      const source = sourceOf([
        heading,
        'Text.',
      ]);

      // Act
      const parsed = parseRules(source);

      // Assert
      expect(parsed).toStrictEqual({
        findings: [],
        rules: [],
      });
    },
  );

  it.each<{
    lines: readonly string[];
    messages: readonly string[];
    name: string;
    rule: Partial<StatedRule>;
  }>([
    {
      lines: [],
      messages: [
        'has no table "| Why | Check | Tags |"',
      ],
      name: 'no table',
      rule: {
        check: '',
        why: '',
      },
    },
    {
      lines: [
        ...TABLE,
        '',
        ...TABLE,
      ],
      messages: [
        'has 2 tables; a rule has one',
      ],
      name: 'two tables',
      rule: {
        check: '',
        why: '',
      },
    },
    {
      lines: [
        '| Why | Check | Lens |',
        '|---|---|---|',
        '| it keeps the code honest. | review | [] |',
      ],
      messages: [
        'has a table whose header is not "| Why | Check | Tags |"',
      ],
      name: 'a wrong header',
      rule: {},
    },
    {
      lines: [
        '| Why | Check | Tags |',
        '| it keeps the code honest. | review | [] |',
      ],
      messages: [
        'has a table whose header is not "| Why | Check | Tags |"',
        "has 0 rows in its table; a rule's table has one",
      ],
      name: 'no delimiter row',
      rule: {
        check: '',
        why: '',
      },
    },
    {
      lines: [
        ...TABLE,
        '| it keeps the tests honest. | test | [] |',
      ],
      messages: [
        "has 2 rows in its table; a rule's table has one",
      ],
      name: 'two rows',
      rule: {},
    },
    {
      lines: [
        '| Why | Check | Tags |',
        '|---|---|---|',
        '| it keeps the code honest. | review |',
      ],
      messages: [
        "has a row of 2 cells; a rule's table has 3",
      ],
      name: 'a row of two cells',
      rule: {},
    },
    {
      lines: [
        '| Why | Check | Tags |',
        '|---|---|---|',
        '|  | review | [] |',
      ],
      messages: [],
      name: 'an empty Why, which the rules check reports',
      rule: {
        why: '',
      },
    },
    {
      lines: [
        '| Why | Check | Tags |',
        '|---|---|---|',
        '| it keeps the code honest. | review | ux, data |',
      ],
      messages: [
        'has the Tags "ux, data"; Tags is a list, such as [security, ux] or []',
      ],
      name: 'Tags that are no list',
      rule: {},
    },
    {
      lines: [
        '| Why | Check | Tags |',
        '| x- | --- | --- |',
        '| it keeps the code honest. | review | [] |',
      ],
      messages: [
        'has a table whose header is not "| Why | Check | Tags |"',
      ],
      name: 'a delimiter cell with a word before its dashes',
      rule: {},
    },
    {
      lines: [
        '| Why | Check | Tags |',
        '| --- | -x | --- |',
        '| it keeps the code honest. | review | [] |',
      ],
      messages: [
        'has a table whose header is not "| Why | Check | Tags |"',
      ],
      name: 'a delimiter cell with a word after its dashes',
      rule: {},
    },
    {
      lines: [
        '| Why | Check | Tags |',
        '|---|---|---|',
        '| it keeps the code honest. | review | see [ux] |',
      ],
      messages: [
        'has the Tags "see [ux]"; Tags is a list, such as [security, ux] or []',
      ],
      name: 'Tags with a word before the list',
      rule: {},
    },
    {
      lines: [
        '| Why | Check | Tags |',
        '|---|---|---|',
        '| it keeps the code honest. | review | [ux] too |',
      ],
      messages: [
        'has the Tags "[ux] too"; Tags is a list, such as [security, ux] or []',
      ],
      name: 'Tags with a word after the list',
      rule: {},
    },
    {
      lines: [
        '**Why:** it keeps the code honest.',
        ...TABLE,
        '**Implements:** `b`',
      ],
      messages: [
        'has the label "Why"; a rule states Why, Check and Tags in its table and holds no label but Example',
        'has the label "Implements"; a rule states Why, Check and Tags in its table and holds no label but Example',
      ],
      name: 'labels of the old form',
      rule: {},
    },
  ])(
    'should report the table and read what it can when a rule has $name',
    ({ lines, messages, rule }) => {
      // Arrange
      const source = sourceOf([
        '## a · MUST',
        'A.',
        ...lines,
      ]);

      // Act
      const parsed = parseRules(source);

      // Assert
      expect(parsed).toStrictEqual({
        findings: messages.map((message) => found(`rule "a" ${message}`)),
        rules: [
          ruleOf(rule),
        ],
      });
    },
  );

  it('should report every rule and return none when the rules sit in the card', () => {
    // Arrange
    const source = {
      ...sourceOf([
        '# Core',
        '## rules-bind · MUST',
        'The rules bind.',
        ...TABLE,
        '## x - MUST',
        '## reasons-are-given → rules-bind',
        'A rule names its reason.',
        ...TABLE,
      ]),
      axis: undefined,
      file: CARD,
    };

    // Act
    const parsed = parseRules(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [
        {
          message: `heading "## x - MUST" looks like a rule but is not ${HEADING_FORMS}`,
          path: CARD,
        },
        {
          message:
            'rule "rules-bind" sits in the card; a block\'s rules live in foundation/, architecture/ or workflow/',
          path: CARD,
        },
        {
          message:
            'rule "reasons-are-given" sits in the card; a block\'s rules live in foundation/, architecture/ or workflow/',
          path: CARD,
        },
      ],
      rules: [],
    });
  });

  it('should report nothing when the card holds prose and no rule', () => {
    // Arrange
    const source = {
      ...sourceOf([
        '# Core',
        'What holds for any program.',
      ]),
      axis: undefined,
      file: CARD,
    };

    // Act
    const parsed = parseRules(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [],
      rules: [],
    });
  });
});
