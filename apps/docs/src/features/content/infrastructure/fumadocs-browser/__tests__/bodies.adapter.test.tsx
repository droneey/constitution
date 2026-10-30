import { afterEach, describe, expect, it } from 'bun:test';

import type { ReactElement } from 'react';
import { Suspense, use } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import type { CompiledMDXProperties } from 'fumadocs-mdx';

import type { PageBody } from '../bodies.adapter';
import { createPageBodies } from '../bodies.adapter';

afterEach(cleanup);

const neverLoads = (): Promise<never> => new Promise(() => undefined);

function FirstHeading({ load }: { load: PageBody['load'] }): ReactElement {
  return <p>{use(load()).toc[0]?.title}</p>;
}

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

const blocksAt = (
  path: string,
): {
  collection: string;
  path: string;
} => ({
  collection: 'blocks',
  path,
});

const pageAt = (path: string): PageBody => {
  const page = createPageBodies(collections).find(blocksAt(path));

  if (page === undefined) {
    throw new Error(`the collection has no page at ${path}`);
  }

  return page;
};

describe('createPageBodies', () => {
  it.each([
    {
      collection: 'guide',
      condition: 'the collection is unknown',
      path: 'core/core.md',
    },
    {
      collection: 'blocks',
      condition: 'the collection has no file at the path',
      path: 'core/names.md',
    },
  ])('should find no body when $condition', ({ collection, path }) => {
    // Arrange
    const bodies = createPageBodies(collections);

    // Act
    const body = bodies.find({
      collection,
      path,
    });

    // Assert
    expect(body).toBeUndefined();
  });

  it('should hand React a body it reads in the same render once its loading has ended', async () => {
    // Arrange
    const core = createPageBodies(collections).find(blocksAt('core/core.md'));

    await core?.load();

    // Act
    render(
      <Suspense>
        <FirstHeading load={core?.load ?? neverLoads} />
      </Suspense>,
    );

    // Assert
    expect(screen.queryByText('Core')?.textContent).toBe('Core');
  });

  it('should keep each page’s body apart from the one loaded before it', async () => {
    // Arrange
    const bodies = createPageBodies(collections);

    await bodies.find(blocksAt('core/core.md'))?.load();

    // Act
    const ui = await bodies.find(blocksAt('domains/ui/ui.md'))?.load();

    // Assert
    expect(ui?.toc).toStrictEqual([
      {
        depth: 2,
        title: 'Ui',
        url: '#ui',
      },
    ]);
  });

  it('should start a body’s loading once however often it is asked', () => {
    // Arrange
    const bodies = createPageBodies(collections);

    // Act
    const loadings = [
      bodies.find(blocksAt('core/core.md'))?.load(),
      bodies.find(blocksAt('core/core.md'))?.load(),
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
