import { describe, expect, it } from 'bun:test';

import { Axis, Level } from '#/kernel/constants';
import type { Finding } from '#/kernel/types';

import { findingOf } from '../../../../../__tests__/constitution.fixtures';
import type { StatedRule } from '../../../../entities';
import { parseRules } from '../rules.utils';

const FILE = 'blocks/core/foundation/principles.md';
const AGREEMENT = 'blocks/core/foundation/agreement.md';
const TABLE = [
  '',
  '| Why | Tags |',
  '|---|---|',
  '| it keeps the code honest. | [] |',
];

const sourceOf = (
  lines: readonly string[],
): {
  axis: Axis;
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
  chapter: undefined,
  file: FILE,
  ownTags: [],
  parent: undefined,
  slug: 'a',
  statedLevel: Level.Must,
  statement: 'A.',
  title: undefined,
  why: 'it keeps the code honest.',
  with: undefined,
  ...fields,
});

const found = (input: { code: string; names: readonly string[] }): Finding =>
  findingOf({
    code: input.code,
    names: input.names,
    path: FILE,
  });

describe('parseRules', () => {
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
          chapter: 'Screens',
          file: 'blocks/core/architecture/with/ui.md',
          ownTags: [
            'ux',
            'a11y',
          ],
          slug: 'four-data-states',
          statement: 'Every data view shows four states.',
          title: 'Principles',
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
      heading: '### a · SHOULD',
      level: Level.Should,
      parent: undefined,
    },
    {
      heading: '### a → b',
      level: undefined,
      parent: 'b',
    },
    {
      heading: '### a → b · MAY',
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
      '### a · MUST',
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
    const parsed = parseRules(source);

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
    const parsed = parseRules(source);

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
        ...TABLE,
        '',
        ...TABLE,
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
        ...TABLE,
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
        ...TABLE,
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
      const parsed = parseRules(source);

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
        ...TABLE,
        '### x - MUST',
      ]),
      file: AGREEMENT,
    };

    // Act
    const parsed = parseRules(source);

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
          file: AGREEMENT,
          slug: 'rules-bind',
          statement: 'The rules bind.',
          title: 'Core',
        }),
      ],
    });
  });
});
