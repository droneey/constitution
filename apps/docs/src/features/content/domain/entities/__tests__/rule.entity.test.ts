import { describe, expect, it } from 'bun:test';

import { Level, Rule } from '../rule.entity';

describe('Rule.of', () => {
  it.each([
    {
      condition: 'a rule binds',
      heading: 'name-says-what · MUST',
      rule: {
        level: Level.Must,
        slug: 'name-says-what',
      },
    },
    {
      condition: 'a rule is left only with a reason',
      heading: 'name-says-what · SHOULD',
      rule: {
        level: Level.Should,
        slug: 'name-says-what',
      },
    },
    {
      condition: 'a rule is a choice',
      heading: 'name-says-what · MAY',
      rule: {
        level: Level.May,
        slug: 'name-says-what',
      },
    },
    {
      condition: 'a rule tightens another',
      heading: 'strict-matcher-only → case-proves-one-intent · SHOULD',
      rule: {
        level: Level.Should,
        tightens: 'case-proves-one-intent',
        slug: 'strict-matcher-only',
      },
    },
    {
      condition: 'a slug holds digits',
      heading: 'file-within-500-lines · MUST',
      rule: {
        level: Level.Must,
        slug: 'file-within-500-lines',
      },
    },
  ])('should read the rule when $condition', ({ heading, rule }) => {
    // Act
    const read = Rule.of(heading);

    // Assert
    expect(read).toStrictEqual(rule);
  });

  it.each([
    {
      condition: 'the heading names no level',
      heading: 'name-says-what',
    },
    {
      condition: 'the level is not one of the three',
      heading: 'name-says-what · MIGHT',
    },
    {
      condition: 'the level is in lower case',
      heading: 'name-says-what · must',
    },
    {
      condition: 'the slug is not kebab-case',
      heading: 'Name says what · MUST',
    },
    {
      condition: 'the slug ends with a hyphen',
      heading: 'name- · MUST',
    },
    {
      condition: 'text precedes the slug',
      heading: 'see name-says-what · MUST',
    },
    {
      condition: 'text follows the level',
      heading: 'name-says-what · MUST now',
    },
    {
      condition: 'the rule it tightens is not kebab-case',
      heading: 'name-says-what → Parent · MUST',
    },
    {
      condition: 'the heading is empty',
      heading: '',
    },
  ])('should read no rule when $condition', ({ heading }) => {
    // Act
    const read = Rule.of(heading);

    // Assert
    expect(read).toBeUndefined();
  });
});

describe('Rule.slugsIn', () => {
  it('should list the slugs of the third-level rule headings when a file holds them', () => {
    // Arrange
    const markdown = [
      '# Names',
      '',
      '### name-says-what · MUST',
      'A name says what it holds.',
      '#### deeper-heading · MUST',
      '## second-level · MUST',
      '### Kinds',
      '### strict-matcher-only → case-proves-one-intent · SHOULD',
    ].join('\n');

    // Act
    const slugs = Rule.slugsIn(markdown);

    // Assert
    expect(slugs).toStrictEqual([
      'name-says-what',
      'strict-matcher-only',
    ]);
  });

  it('should list no slug when a file holds no rule', () => {
    // Arrange
    const markdown = '# Names\n\nNo rule here.';

    // Act
    const slugs = Rule.slugsIn(markdown);

    // Assert
    expect(slugs).toStrictEqual([]);
  });
});

describe('Rule.unknownExamplesOf', () => {
  it('should list the examples no rule names when some name none', () => {
    // Arrange
    const rules = new Set([
      'name-says-what',
      'strict-matcher-only',
    ]);

    // Act
    const unknown = Rule.unknownExamplesOf(
      [
        'name-says-what',
        'no-such-rule',
        'strict-matcher-only',
        'another-stray',
      ],
      rules,
    );

    // Assert
    expect(unknown).toStrictEqual([
      'no-such-rule',
      'another-stray',
    ]);
  });
});
