import { describe, expect, it } from 'bun:test';

import { parseRules } from '../rules.utils';

const FILE = 'blocks/core/principles.md';

const sourceOf = (
  lines: readonly string[],
): {
  block: string;
  file: string;
  text: string;
  with: string | null;
} => ({
  block: 'core',
  file: FILE,
  text: lines.join('\n'),
  with: null,
});

describe('parseRules', () => {
  it('should read the slug, level, statement and labels when a rule is complete', () => {
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

  it('should keep a rule intact when a heading of another level follows it', () => {
    // Arrange
    const source = sourceOf([
      '## a · SHOULD',
      'A.',
      '**Check:** tool — architecture',
      '### b · MUST',
      '**Check:** test',
      '## Requirements for implementation',
      'Not a rule.',
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
          with: null,
        },
      ],
    });
  });

  it.each([
    '## x - MUST',
    '## x — MUST',
    '## x • MUST',
    '## x ·MUST',
    '## x (MAY)',
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

  it('should report a label when a rule gives it twice', () => {
    // Arrange
    const source = sourceOf([
      '## a · MAY',
      'A.',
      '**Why:** one.',
      '**Why:** two.',
    ]);

    // Act
    const parsed = parseRules(source);

    // Assert
    expect(parsed.findings).toStrictEqual([
      {
        message: 'rule "a" has the label "Why" twice',
        path: FILE,
      },
    ]);
  });

  it('should report a label when it is none of the rule labels', () => {
    // Arrange
    const source = sourceOf([
      '## a · MAY',
      'A.',
      '**Implement:** `b`',
    ]);

    // Act
    const parsed = parseRules(source);

    // Assert
    expect(parsed.findings).toStrictEqual([
      {
        message:
          'rule "a" has the label "Implement", which is not one of Why, Check, Tags, Example, Implements',
        path: FILE,
      },
    ]);
  });
});
