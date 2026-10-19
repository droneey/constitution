import { describe, expect, it } from 'bun:test';

import { Level } from '../../entities';
import {
  pageSlugsOf,
  ruleOf,
  ruleSlugsOf,
  slugsOfMarkdownAddress,
  summaryLineOf,
  titleOf,
  unknownExamplesOf,
} from '../rules.utils';

describe('ruleOf', () => {
  it.each([
    {
      condition: 'a rule binds',
      heading: 'name-says-what · MUST',
      rule: {
        level: Level.Must,
        parent: undefined,
        slug: 'name-says-what',
      },
    },
    {
      condition: 'a rule is left only with a reason',
      heading: 'name-says-what · SHOULD',
      rule: {
        level: Level.Should,
        parent: undefined,
        slug: 'name-says-what',
      },
    },
    {
      condition: 'a rule is a choice',
      heading: 'name-says-what · MAY',
      rule: {
        level: Level.May,
        parent: undefined,
        slug: 'name-says-what',
      },
    },
    {
      condition: 'a rule tightens another',
      heading: 'strict-matcher-only → case-proves-one-intent · SHOULD',
      rule: {
        level: Level.Should,
        parent: 'case-proves-one-intent',
        slug: 'strict-matcher-only',
      },
    },
    {
      condition: 'a slug holds digits',
      heading: 'file-within-500-lines · MUST',
      rule: {
        level: Level.Must,
        parent: undefined,
        slug: 'file-within-500-lines',
      },
    },
  ])('should read the rule when $condition', ({ heading, rule }) => {
    // Arrange
    const text = heading;

    // Act
    const read = ruleOf(text);

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
      condition: 'the parent is not kebab-case',
      heading: 'name-says-what → Parent · MUST',
    },
    {
      condition: 'the heading is empty',
      heading: '',
    },
  ])('should read no rule when $condition', ({ heading }) => {
    // Arrange
    const text = heading;

    // Act
    const read = ruleOf(text);

    // Assert
    expect(read).toBeUndefined();
  });
});

describe('ruleSlugsOf', () => {
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
    const slugs = ruleSlugsOf(markdown);

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
    const slugs = ruleSlugsOf(markdown);

    // Assert
    expect(slugs).toStrictEqual([]);
  });
});

describe('titleOf', () => {
  it('should read the first first-level heading when a file has one', () => {
    // Arrange
    const markdown = 'intro\n## Second\n# The title\n# Another';

    // Act
    const title = titleOf(markdown);

    // Assert
    expect(title).toBe('The title');
  });

  it('should read no title when a file has no first-level heading', () => {
    // Arrange
    const markdown = '## Second\n#Tight';

    // Act
    const title = titleOf(markdown);

    // Assert
    expect(title).toBeUndefined();
  });
});

describe('summaryLineOf', () => {
  it('should read the first line of the first quote when a file has one', () => {
    // Arrange
    const markdown = '# Title\n\n> Governs **names**.\n> And more.';

    // Act
    const summary = summaryLineOf(markdown);

    // Assert
    expect(summary).toBe('Governs **names**.');
  });

  it('should read no summary when a file has no quote', () => {
    // Arrange
    const markdown = '# Title\n\n>tight';

    // Act
    const summary = summaryLineOf(markdown);

    // Assert
    expect(summary).toBeUndefined();
  });
});

describe('pageSlugsOf', () => {
  it.each([
    {
      condition: 'the file is its folder card',
      path: 'core/core.md',
      slugs: [
        'core',
      ],
    },
    {
      condition: 'the file is a chapter',
      path: 'core/names.md',
      slugs: [
        'core',
        'names',
      ],
    },
    {
      condition: 'the file is a card deeper down',
      path: 'implementations/bun-test/bun-test.md',
      slugs: [
        'implementations',
        'bun-test',
      ],
    },
    {
      condition: "the file is a platform's card, inside contexts",
      path: 'contexts/platforms/browser/browser.md',
      slugs: [
        'contexts',
        'platforms',
        'browser',
      ],
    },
    {
      condition: 'the file sits at the root',
      path: 'core.md',
      slugs: [
        'core',
      ],
    },
    {
      condition: 'only a folder above the parent repeats the name',
      path: 'core/names/core.md',
      slugs: [
        'core',
        'names',
        'core',
      ],
    },
    {
      condition: 'the extension is not Markdown',
      path: 'core/core.mdx',
      slugs: [
        'core',
        'core.mdx',
      ],
    },
  ])('should name the page when $condition', ({ path, slugs }) => {
    // Arrange
    const file = path;

    // Act
    const page = pageSlugsOf(file);

    // Assert
    expect(page).toStrictEqual(slugs);
  });
});

describe('unknownExamplesOf', () => {
  it('should list the examples no rule names when some name none', () => {
    // Arrange
    const rules = new Set([
      'name-says-what',
      'strict-matcher-only',
    ]);

    // Act
    const unknown = unknownExamplesOf(
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

describe('slugsOfMarkdownAddress', () => {
  it.each([
    {
      condition: 'the address names the index',
      segments: [
        'index.md',
      ],
      slugs: [],
    },
    {
      condition: 'the address names a page',
      segments: [
        'core',
        'names.md',
      ],
      slugs: [
        'core',
        'names',
      ],
    },
    {
      condition: 'a folder before the last segment ends like a file',
      segments: [
        'guides.md',
        'upgrade.md',
      ],
      slugs: [
        'guides.md',
        'upgrade',
      ],
    },
    {
      condition: 'an index sits in a folder',
      segments: [
        'core',
        'index.md',
      ],
      slugs: [
        'core',
        'index',
      ],
    },
    {
      condition: 'the first folder is named index',
      segments: [
        'index',
        'upgrade.md',
      ],
      slugs: [
        'index',
        'upgrade',
      ],
    },
    {
      condition: 'the last segment is not Markdown',
      segments: [
        'core',
        'names.mdx',
      ],
      slugs: [
        'core',
        'names.mdx',
      ],
    },
    {
      condition: 'a single page is not the index',
      segments: [
        'glossary.md',
      ],
      slugs: [
        'glossary',
      ],
    },
  ])('should read the slugs when $condition', ({ segments, slugs }) => {
    // Arrange
    const address = segments;

    // Act
    const page = slugsOfMarkdownAddress(address);

    // Assert
    expect(page).toStrictEqual(slugs);
  });
});
