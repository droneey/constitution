import { describe, expect, it } from 'bun:test';

import type { Rule } from '../../../../entities';
import { parseRules } from '../rules.utils';

const FILE = 'blocks/core/principles.md';

const sourceOf = (
  lines: readonly string[],
): {
  block: string;
  file: string;
  text: string;
  with: string | undefined;
} => ({
  block: 'core',
  file: FILE,
  text: lines.join('\n'),
  with: undefined,
});

describe('parseRules', () => {
  it('should read the slug, the level, the statement and the labels when a rule is complete', () => {
    // Arrange
    const source = {
      ...sourceOf([
        '# Principles',
        '## four-data-states · MUST',
        'Every data view shows',
        'four states.',
        '**Why:** an empty screen cannot be told from a slow one.',
        '**Check:** test',
        '**Tags:** ux, a11y',
        '**Example:**',
        '**Implements:** `rules-bind`',
        'Prose after the labels.',
      ]),
      with: 'ui',
    };

    // Act
    const parsed = parseRules(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [],
      rules: [
        {
          block: 'core',
          file: FILE,
          labels: {
            check: 'test',
            example: '',
            implements: '`rules-bind`',
            tags: 'ux, a11y',
            why: 'an empty screen cannot be told from a slow one.',
          },
          level: 'MUST',
          slug: 'four-data-states',
          statement: 'Every data view shows four states.',
          with: 'ui',
        },
      ],
    });
  });

  it('should trim the statement and the labels when their lines are blank, indented or padded', () => {
    // Arrange
    const source = sourceOf([
      '## four-data-states · MUST',
      '',
      '  Every data view shows',
      '  four states.  ',
      '**Why:** an empty screen cannot be told from a slow one.  ',
    ]);

    // Act
    const parsed = parseRules(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [],
      rules: [
        {
          block: 'core',
          file: FILE,
          labels: {
            why: 'an empty screen cannot be told from a slow one.',
          },
          level: 'MUST',
          slug: 'four-data-states',
          statement: 'Every data view shows four states.',
          with: undefined,
        },
      ],
    });
  });

  it('should keep a bold label in the statement when it sits inside a line', () => {
    // Arrange
    const source = sourceOf([
      '## reasons-are-given · SHOULD',
      'A rule names its reason after **Why:** in one sentence.',
    ]);

    // Act
    const parsed = parseRules(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [],
      rules: [
        {
          block: 'core',
          file: FILE,
          labels: {},
          level: 'SHOULD',
          slug: 'reasons-are-given',
          statement: 'A rule names its reason after **Why:** in one sentence.',
          with: undefined,
        },
      ],
    });
  });

  it('should end each rule at the next heading when headings of several levels follow one another', () => {
    // Arrange
    const source = sourceOf([
      '## a · SHOULD',
      'A.',
      '**Check:** tool — architecture',
      '### b · MUST',
      '**Check:** test',
      '## c · MAY',
      'C.',
    ]);

    // Act
    const parsed = parseRules(source);

    // Assert
    expect(parsed).toStrictEqual({
      findings: [
        {
          message:
            'heading "### b · MUST" looks like a rule but is not "## <slug> · MUST|SHOULD|MAY"',
          path: FILE,
        },
      ],
      rules: [
        {
          block: 'core',
          file: FILE,
          labels: {
            check: 'tool — architecture',
          },
          level: 'SHOULD',
          slug: 'a',
          statement: 'A.',
          with: undefined,
        },
        {
          block: 'core',
          file: FILE,
          labels: {},
          level: 'MAY',
          slug: 'c',
          statement: 'C.',
          with: undefined,
        },
      ],
    });
  });

  it.each([
    '## x - MUST',
    '## x · MUST.',
    '# x · SHOULD',
  ])(
    'should report %p as a stray heading when it misses the rule heading form',
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
          {
            message: `heading "${heading}" looks like a rule but is not "## <slug> · MUST|SHOULD|MAY"`,
            path: FILE,
          },
        ],
        rules: [],
      });
    },
  );

  it('should neither read nor report a heading when a level word sits inside it', () => {
    // Arrange
    const source = sourceOf([
      '## MUST, SHOULD and MAY in practice',
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
    labels: Rule['labels'];
    lines: readonly string[];
    message: string;
  }>([
    {
      labels: {
        why: 'one.',
      },
      lines: [
        '**Why:** one.',
        '**Why:** two.',
      ],
      message: 'rule "a" has the label "Why" twice',
    },
    {
      labels: {},
      lines: [
        '**Implement:** `b`',
      ],
      message:
        'rule "a" has the label "Implement", which is not one of Why, Check, Tags, Example, Implements',
    },
  ])(
    'should report that $message and read the rest of the rule when a label line is not one the rule takes',
    ({ labels, lines, message }) => {
      // Arrange
      const source = sourceOf([
        '## a · MAY',
        'A.',
        ...lines,
      ]);

      // Act
      const parsed = parseRules(source);

      // Assert
      expect(parsed).toStrictEqual({
        findings: [
          {
            message,
            path: FILE,
          },
        ],
        rules: [
          {
            block: 'core',
            file: FILE,
            labels,
            level: 'MAY',
            slug: 'a',
            statement: 'A.',
            with: undefined,
          },
        ],
      });
    },
  );
});
