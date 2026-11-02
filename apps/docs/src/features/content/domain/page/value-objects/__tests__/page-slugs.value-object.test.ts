import { describe, expect, it } from 'bun:test';

import { ValueFailure } from '../../../shared/errors';
import { failureOf } from '../../../shared/errors/__tests__/invalid-value.fixtures';
import { PageSlugs } from '../page-slugs.value-object';

describe('PageSlugs.create', () => {
  it('should keep the segments of a page six deep', () => {
    // Act
    const slugs = PageSlugs.create([
      'contexts',
      'languages',
      'typescript',
      'foundation',
      'with',
      'workspace',
    ]);

    // Assert
    expect<readonly string[]>(slugs).toStrictEqual([
      'contexts',
      'languages',
      'typescript',
      'foundation',
      'with',
      'workspace',
    ]);
  });

  it('should refuse the segments when one is no slug', () => {
    // Act
    const failure = failureOf(() =>
      PageSlugs.create([
        'guides',
        'Write-a-pack',
      ]),
    );

    // Assert
    expect(failure).toStrictEqual({
      code: ValueFailure.PageSlugsInvalid,
      details: {
        value: 'guides/Write-a-pack',
      },
    });
  });
});

describe('PageSlugs.is', () => {
  it.each([
    {
      candidate: [
        'domains',
        '_api',
      ],
      condition: "an abstract block's page, whose id opens with its mark",
      expected: true,
    },
    {
      candidate: [],
      condition: 'the overview, which has no segment',
      expected: true,
    },
    {
      candidate: [
        'guides',
        'Write-a-pack',
      ],
      condition: 'a segment holds a capital',
      expected: false,
    },
    {
      candidate: [
        'guides',
        '-draft',
      ],
      condition: 'a segment starts with a character no slug holds',
      expected: false,
    },
    {
      candidate: [
        'domains',
        '__api',
      ],
      condition: 'a segment opens with more than the one mark of an abstract block',
      expected: false,
    },
    {
      candidate: [
        'guides',
        'write_a_pack',
      ],
      condition: 'a segment ends with a character no slug holds',
      expected: false,
    },
    {
      candidate: [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
      ],
      condition: 'they are deeper than any page',
      expected: false,
    },
    {
      candidate: [
        7,
      ],
      condition: 'a segment is no text',
      expected: false,
    },
    {
      candidate: 'guides/write-a-pack',
      condition: 'they are one text',
      expected: false,
    },
  ])('should answer $expected when the segments are $condition', ({ candidate, expected }) => {
    // Act
    const isPageSlugs = PageSlugs.is(candidate);

    // Assert
    expect(isPageSlugs).toBe(expected);
  });
});

describe('PageSlugs.ofAddress', () => {
  it.each([
    {
      address: 'guides/write-a-pack',
      condition: 'it names a page',
      expected: [
        'guides',
        'write-a-pack',
      ],
    },
    {
      address: 'guides//write-a-pack/',
      condition: 'it holds empty segments',
      expected: [
        'guides',
        'write-a-pack',
      ],
    },
    {
      address: '',
      condition: 'it is empty, the overview',
      expected: [],
    },
    {
      address: 'guides/Write-a-pack',
      condition: 'no page can have it',
      expected: undefined,
    },
  ])('should read the slugs when $condition', ({ address, expected }) => {
    // Act
    const slugs = PageSlugs.ofAddress(address);

    // Assert
    expect<readonly string[] | undefined>(slugs).toStrictEqual(expected);
  });
});

describe('PageSlugs.ofMarkdownAddress', () => {
  it.each([
    {
      address: 'index.md',
      condition: 'it names the overview',
      expected: [],
    },
    {
      address: 'index',
      condition: 'it names the overview without its extension',
      expected: [],
    },
    {
      address: 'core/names.md',
      condition: 'it names a page',
      expected: [
        'core',
        'names',
      ],
    },
    {
      address: 'core/index.md',
      condition: 'an index sits in a folder',
      expected: [
        'core',
        'index',
      ],
    },
    {
      address: 'index/upgrade.md',
      condition: 'the first folder is named index',
      expected: [
        'index',
        'upgrade',
      ],
    },
    {
      address: 'glossary.md',
      condition: 'a single page is not the overview',
      expected: [
        'glossary',
      ],
    },
    {
      address: 'guides.md/upgrade.md',
      condition: 'a folder before the last segment ends like a file',
      expected: undefined,
    },
    {
      address: 'core/names.mdx',
      condition: 'the last segment is not Markdown',
      expected: undefined,
    },
  ])('should read the slugs when $condition', ({ address, expected }) => {
    // Act
    const slugs = PageSlugs.ofMarkdownAddress(address);

    // Assert
    expect<readonly string[] | undefined>(slugs).toStrictEqual(expected);
  });
});
