import { describe, expect, it } from 'bun:test';

import type { Node } from 'fumadocs-core/page-tree';
import { loader } from 'fumadocs-core/source';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  collectionPathOf,
  crossLinks,
  mainFileAsIndex,
  markdownOfPage,
  renamed,
} from '../pages.adapter';

const ARROW =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right" aria-hidden="true" data-cross-link=""><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';

/** the addresses of the pages among a tree's nodes */
const addressesOf = (nodes: readonly Node[]): readonly string[] =>
  nodes.flatMap((node) =>
    node.type === 'page'
      ? [
          node.url,
        ]
      : [],
  );

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

describe('mainFileAsIndex', () => {
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
      condition: "the file is an axis's main chapter",
      path: 'domains/ui/architecture/ui.md',
      served: 'domains/ui/architecture/index.md',
    },
    {
      condition: "the file is the workflow axis's main chapter",
      path: 'domains/ui/workflow/ui.md',
      served: 'domains/ui/workflow/index.md',
    },
    {
      condition: 'the file is a chapter of an axis',
      path: 'domains/ui/architecture/state.md',
      served: 'domains/ui/architecture/state.md',
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
    const page = mainFileAsIndex(file);

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

  it('should lead a link to a whole page to its main region, so the page is found in its own folder', () => {
    // Arrange
    const source = loader(
      {
        guide: {
          files: [
            {
              data: {
                pages: [
                  '[Placement](/docs/core/placement)',
                  '[Precedence](/docs/core#precedence)',
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
    const addresses = addressesOf(source.getPageTree().children);

    // Assert
    expect(addresses).toStrictEqual([
      '/docs/core/placement#main',
      '/docs/core#precedence',
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
