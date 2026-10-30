import { afterEach, describe, expect, it } from 'bun:test';

import { createSearchAPI } from 'fumadocs-core/search/server';

import { SearchResultKind } from '../../../domain/search/entities';
import { SearchError, SearchFailure } from '../../../domain/search/errors';
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

// Why: Fumadocs keeps an index by its address for the page's life, so each case serves its own.
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

const failureOf = (search: Promise<unknown>): Promise<unknown> =>
  search.catch((error: unknown) =>
    error instanceof SearchError
      ? {
          cause: error.cause instanceof Error ? error.cause.name : error.cause,
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
      indexAddress: '/api/search',
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

  it.each([
    {
      answer: (): Promise<Response> =>
        Promise.resolve(
          new Response(undefined, {
            status: 404,
          }),
        ),
      cause: 'Error',
      condition: 'the site serves no index',
      indexAddress: '/api/missing',
    },
    {
      answer: (): Promise<Response> => Promise.reject(new TypeError('Failed to fetch')),
      cause: 'TypeError',
      condition: 'the network fails',
      indexAddress: '/api/offline',
    },
    {
      answer: (): Promise<Response> => Promise.resolve(new Response('<!doctype html>')),
      cause: 'SyntaxError',
      condition: 'the index holds no JSON',
      indexAddress: '/api/page',
    },
  ])(
    'should fail with the address, keeping the cause, when $condition',
    async ({ answer, cause, indexAddress }) => {
      // Arrange
      serveAt(indexAddress, answer);

      // Act
      const search = createStaticPageSearch({
        indexAddress,
      }).search('pack');

      // Assert
      expect(await failureOf(search)).toStrictEqual({
        cause,
        code: SearchFailure.IndexUnavailable,
        details: {
          address: indexAddress,
        },
      });
    },
  );

  it.each([
    {
      condition: 'it is of another class',
      indexAddress: '/api/refused',
      refusal: new RangeError('no such address'),
    },
    {
      condition: "it carries a code, as the search engine's own errors do",
      indexAddress: '/api/engine',
      refusal: Object.assign(new Error('no such index'), {
        code: 'IVF_INDEX_REQUIRES_FACTORY',
      }),
    },
  ])(
    'should let a failure it does not know through as it is when $condition',
    async ({ indexAddress, refusal }) => {
      // Arrange
      serveAt(indexAddress, () => Promise.reject(refusal));

      // Act
      const search = createStaticPageSearch({
        indexAddress,
      }).search('pack');

      // Assert
      expect(await failureOf(search)).toBe(refusal);
    },
  );
});
