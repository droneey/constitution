import { describe, expect, it } from 'bun:test';

import { loader } from 'fumadocs-core/source';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  cardAsIndex,
  collectionPathOf,
  crossLinks,
  markdownOfPage,
  renamed,
} from '../pages.adapter';

const ARROW =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right" aria-hidden="true" data-cross-link=""><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';

describe('renamed', () => {
  it('should serve every file under the path asked when a source is renamed', () => {
    // Arrange
    const source = {
      files: [
        {
          path: 'README.md',
          type: 'page',
        },
      ],
      name: 'overview',
    };

    // Act
    const served = renamed(source, (path) => `served-${path}`);

    // Assert
    expect(served).toStrictEqual({
      files: [
        {
          path: 'served-README.md',
          type: 'page',
        },
      ],
      name: 'overview',
    });
  });
});

describe('collectionPathOf', () => {
  it('should give the path the collection knows when the site serves the page under another', () => {
    // Arrange
    renamed(
      {
        files: [
          {
            path: 'PROJECT.md',
          },
        ],
      },
      () => 'renamed-glossary.md',
    );

    // Act
    const path = collectionPathOf('renamed-glossary.md');

    // Assert
    expect(path).toBe('PROJECT.md');
  });

  it('should give the path itself when the site serves the page under its own', () => {
    // Arrange
    const served = 'guides/never-renamed.md';

    // Act
    const path = collectionPathOf(served);

    // Assert
    expect(path).toBe('guides/never-renamed.md');
  });
});

describe('cardAsIndex', () => {
  it.each([
    {
      condition: 'the file is the card of a block',
      path: 'core/core.md',
      served: 'core/index.md',
    },
    {
      condition: 'the file is the card of a block deeper down',
      path: 'implementations/bun-test/bun-test.md',
      served: 'implementations/bun-test/index.md',
    },
    {
      condition: 'the file is a chapter',
      path: 'core/names.md',
      served: 'core/names.md',
    },
    {
      condition: 'the file sits at the root',
      path: 'core.md',
      served: 'core.md',
    },
  ])('should serve the page when $condition', ({ path, served }) => {
    // Arrange
    const file = path;

    // Act
    const page = cardAsIndex(file);

    // Assert
    expect(page).toBe(served);
  });
});

describe('crossLinks', () => {
  it('should mark only the entries of the sidebar that lead to another section of the documentation when the loader builds it', () => {
    // Arrange
    const source = loader(
      {
        guide: {
          files: [
            {
              data: {
                title: 'Overview',
              },
              path: 'index.md',
              type: 'page',
            },
            {
              data: {
                pages: [
                  'index',
                  '[Precedence](/docs/core#precedence)',
                  'external:[Names](/docs/core/names)',
                  '[Repository](https://github.com/droneey/constitution)',
                ],
              },
              path: 'meta.json',
              type: 'meta',
            },
          ],
        },
      },
      {
        baseUrl: '/docs',
        plugins: [
          crossLinks,
        ],
      },
    );

    // Act
    const entries = source.getPageTree().children;

    // Assert
    expect(entries.map((entry) => renderToStaticMarkup(entry.name))).toStrictEqual([
      'Overview',
      `Precedence${ARROW}`,
      'Names',
      'Repository',
    ]);
  });
});

describe('markdownOfPage', () => {
  it('should head the processed Markdown with the title and address of the page', async () => {
    // Arrange
    const page = {
      data: {
        getText: (kind: 'processed'): Promise<string> => Promise.resolve(`The ${kind} body.`),
        title: 'Names',
      },
      url: '/docs/core/names',
    };

    // Act
    const markdown = await markdownOfPage(page);

    // Assert
    expect(markdown).toBe('# Names (/docs/core/names)\n\nThe processed body.');
  });
});
