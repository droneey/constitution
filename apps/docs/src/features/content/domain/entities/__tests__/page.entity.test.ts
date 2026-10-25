import { describe, expect, it } from 'bun:test';

import { pageSlugsOf, slugsOfMarkdownAddress, summaryLineOf, titleOf } from '../page.entity';

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
    // Act
    const page = pageSlugsOf(path);

    // Assert
    expect(page).toStrictEqual(slugs);
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
    // Act
    const page = slugsOfMarkdownAddress(segments);

    // Assert
    expect(page).toStrictEqual(slugs);
  });
});
