import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, render, screen } from '@testing-library/react';
import type { CompiledMDXProperties } from 'fumadocs-mdx';

import { createPageBodies } from '../bodies.adapter';

type PageBodies = ReturnType<typeof createPageBodies>;

afterEach(cleanup);

const compiledPage = (title: string): CompiledMDXProperties => ({
  default: () => <h1>{title}</h1>,
  frontmatter: {},
  structuredData: {
    contents: [],
    headings: [],
  },
  toc: [
    {
      depth: 2,
      title,
      url: `#${title.toLowerCase()}`,
    },
  ],
});

const collections = {
  blocks: {
    raw: {
      './core/core.md': () => Promise.resolve(compiledPage('Core')),
      './domains/ui/ui.md': () => Promise.resolve(compiledPage('Ui')),
    },
  },
};

const pageAt = (path: string): NonNullable<ReturnType<PageBodies['pageBodyOf']>> => {
  const page = createPageBodies(collections).pageBodyOf('blocks', path);

  if (page === undefined) {
    throw new Error(`the collection has no page at ${path}`);
  }

  return page;
};

describe('createPageBodies', () => {
  it.each([
    {
      condition: 'the collection is unknown',
      path: 'core/core.md',
      type: 'guide',
    },
    {
      condition: 'the collection has no file at the path',
      path: 'core/names.md',
      type: 'blocks',
    },
  ])('should find no body when $condition', ({ path, type }) => {
    // Arrange
    const bodies = createPageBodies(collections);

    // Act
    const body = bodies.pageBodyOf(type, path);

    // Assert
    expect(body).toBeUndefined();
  });

  it('should keep a body loaded once its loading ends, and no other page’s', async () => {
    // Arrange
    const bodies = createPageBodies(collections);
    const core = bodies.pageBodyOf('blocks', 'core/core.md');

    // Act
    await core?.load();

    // Assert
    expect({
      core: core?.loaded()?.toc,
      ui: bodies.pageBodyOf('blocks', 'domains/ui/ui.md')?.loaded(),
    }).toStrictEqual({
      core: [
        {
          depth: 2,
          title: 'Core',
          url: '#core',
        },
      ],
      ui: undefined,
    });
  });

  it('should start a body’s loading once however often it is asked', () => {
    // Arrange
    const bodies = createPageBodies(collections);

    // Act
    const loadings = [
      bodies.pageBodyOf('blocks', 'core/core.md')?.load(),
      bodies.pageBodyOf('blocks', 'core/core.md')?.load(),
    ];

    // Assert
    expect(loadings[0]).toBe(loadings[1]);
  });

  it('should render the page’s compiled body', async () => {
    // Arrange
    const { body: Body, load } = pageAt('domains/ui/ui.md');

    await load();

    // Act
    render(<Body />);

    // Assert
    expect(
      (
        await screen.findByRole('heading', {
          name: 'Ui',
        })
      ).tagName,
    ).toBe('H1');
  });
});
