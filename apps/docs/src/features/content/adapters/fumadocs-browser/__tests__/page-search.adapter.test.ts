import { afterEach, describe, expect, it } from 'bun:test';

import { createSearchAPI } from 'fumadocs-core/search/server';

import { SearchResultKind } from '../../../domain/entities';
import { SearchError, SearchFailure } from '../../../domain/errors';
import { createStaticPageSearch } from '../page-search.adapter';

const searchIndex = createSearchAPI('advanced', {
  indexes: [
    {
      breadcrumbs: [
        'Guides',
      ],
      description: 'A pack holds blocks.',
      id: 'pack',
      structuredData: {
        contents: [
          {
            content: 'pack | the folder of blocks',
            heading: 'layout',
            table: 'parts',
          },
        ],
        headings: [
          {
            content: 'Pack layout',
            id: 'layout',
          },
        ],
      },
      title: 'Write a pack',
      url: '/docs/guides/write-a-pack',
    },
  ],
});

const refusingFetch = globalThis.fetch;

/** Fumadocs keeps an index by its address for the page's life, so each case serves its own */
const serveAt = (address: string, answer: () => Promise<Response>): void => {
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: (input: RequestInfo | URL): Promise<Response> =>
      input === address
        ? answer()
        : Promise.resolve(
            new Response(undefined, {
              status: 404,
            }),
          ),
    writable: true,
  });
};

afterEach(() => {
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: refusingFetch,
    writable: true,
  });
});

/** the code and the details a search failed with, or the error itself when it is none of the feature's */
const failureOf = (search: Promise<unknown>): Promise<unknown> =>
  search.catch((error: unknown) =>
    error instanceof SearchError
      ? {
          code: error.code,
          details: error.details,
        }
      : error,
  );

describe('createStaticPageSearch', () => {
  it('should find the page, its headings and its text that match the query', async () => {
    // Arrange
    serveAt('/api/search', () => searchIndex.staticGET());

    // Act
    const results = await createStaticPageSearch({
      address: '/api/search',
    }).search('pack');

    // Assert
    expect(results).toStrictEqual([
      {
        breadcrumbs: [
          'Guides',
        ],
        content: 'Write a pack',
        id: 'pack',
        kind: SearchResultKind.Page,
        url: '/docs/guides/write-a-pack',
      },
      {
        breadcrumbs: [],
        content: 'Pack layout',
        id: 'pack-1',
        kind: SearchResultKind.Heading,
        url: '/docs/guides/write-a-pack#layout',
      },
      {
        breadcrumbs: [],
        content: 'A pack holds blocks.',
        id: 'pack-0',
        kind: SearchResultKind.Text,
        url: '/docs/guides/write-a-pack',
      },
      {
        breadcrumbs: [],
        content: 'pack | the folder of blocks',
        id: 'pack-2',
        kind: SearchResultKind.Text,
        table: 'parts',
        url: '/docs/guides/write-a-pack#layout',
      },
    ]);
  });

  it('should fail with the address when the site serves no index', async () => {
    // Arrange
    serveAt('/api/search', () => searchIndex.staticGET());

    // Act
    const search = createStaticPageSearch({
      address: '/api/missing',
    }).search('pack');

    // Assert
    expect(await failureOf(search)).toStrictEqual({
      code: SearchFailure.IndexUnavailable,
      details: {
        address: '/api/missing',
      },
    });
  });
});
