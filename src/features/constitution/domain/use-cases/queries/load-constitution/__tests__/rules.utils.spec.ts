import { describe, expect, it } from 'bun:test';

import { parseRules } from '../rules.utils';

const source = (text: string) => ({
  block: 'ui',
  file: 'blocks/domains/ui/ui.md',
  text,
  with: null,
});

describe('parseRules', () => {
  it('should read a rule with its statement and labels', () => {
    // Arrange
    const text = [
      '# UI',
      '',
      '## four-data-states · MUST',
      'Every data view shows four states:',
      'loading, empty, error and content.',
      '**Why:** an empty screen cannot be told from a slow one.',
      '**Check:** test',
      '**Tags:** ux, a11y',
      '',
    ].join('\n');

    // Act
    const { rules, strayHeadings } = parseRules(source(text));

    // Assert
    expect(strayHeadings).toStrictEqual([]);
    expect(rules).toStrictEqual([
      {
        block: 'ui',
        file: 'blocks/domains/ui/ui.md',
        labels: {
          check: 'test',
          tags: 'ux, a11y',
          why: 'an empty screen cannot be told from a slow one.',
        },
        level: 'MUST',
        slug: 'four-data-states',
        statement:
          'Every data view shows four states: loading, empty, error and content.',
        with: null,
      },
    ]);
  });

  it('should end a rule at the next section heading', () => {
    // Arrange
    const text = [
      '## a · SHOULD',
      'A.',
      '## Requirements for implementation',
      'Not a rule.',
    ].join('\n');

    // Act
    const { rules } = parseRules(source(text));

    // Assert
    expect(rules.map((rule) => rule.statement)).toStrictEqual([
      'A.',
    ]);
  });

  it('should ignore a heading inside a fenced block', () => {
    // Arrange
    const text = [
      '## a · MAY',
      'A.',
      '**Example:**',
      '```md',
      '## b · MUST',
      '```',
    ].join('\n');

    // Act
    const { rules } = parseRules(source(text));

    // Assert
    expect(rules.map((rule) => rule.slug)).toStrictEqual([
      'a',
    ]);
    expect(rules[0]?.labels.example).toBe('');
  });

  it('should keep text after the labels out of the statement', () => {
    // Arrange
    const text = [
      '## a · MUST',
      'A.',
      '**Why:** because.',
      'More about why.',
    ].join('\n');

    // Act
    const { rules } = parseRules(source(text));

    // Assert
    expect(rules[0]?.statement).toBe('A.');
  });

  it('should report a heading that looks like a rule but is not one', () => {
    // Act
    const { rules, strayHeadings } = parseRules(source('## a · MUSTT\nA.\n'));

    // Assert
    expect(rules).toStrictEqual([]);
    expect(strayHeadings).toStrictEqual([
      {
        block: 'ui',
        file: 'blocks/domains/ui/ui.md',
        heading: '## a · MUSTT',
      },
    ]);
  });
});
