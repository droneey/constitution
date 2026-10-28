import type { SortedResult } from 'fumadocs-core/search';
import { staticClient } from 'fumadocs-core/search/client/orama-static';

import type { PageSearch } from '../../domain/contracts';
import type { SearchResult } from '../../domain/entities';
import { SearchResultKind } from '../../domain/entities';
import { SearchError } from '../../domain/errors';

interface StaticPageSearchInput {
  readonly indexAddress: string;
}

const kinds: Readonly<Record<SortedResult['type'], SearchResultKind>> = {
  heading: SearchResultKind.Heading,
  page: SearchResultKind.Page,
  text: SearchResultKind.Text,
};

const resultOf = (hit: SortedResult): SearchResult => ({
  breadcrumbs: hit.breadcrumbs ?? [],
  content: hit.content,
  id: hit.id,
  kind: kinds[hit.type],
  ...(hit.table === undefined
    ? {}
    : {
        table: hit.table,
      }),
  url: hit.url,
});

/**
 * Fetch rejects with a TypeError when the network fails, the index's read with a SyntaxError when it
 * holds no JSON, and Fumadocs with an Error of no class and no code of its own when the site answers
 * no index, where the search engine's own errors carry a code
 */
const isUnavailableIndex = (error: unknown): boolean =>
  error instanceof TypeError ||
  error instanceof SyntaxError ||
  // Stryker disable next-line ConditionalExpression: only an error has a class to compare, so the check only narrows its type
  (error instanceof Error && error.constructor === Error && !('code' in error));

/**
 * Searches in the browser the index the site's server exported, downloaded once on the first search;
 * Fumadocs keeps it for the page's life, by its address.
 */
export const createStaticPageSearch = ({ indexAddress }: StaticPageSearchInput): PageSearch => {
  const client = staticClient({
    from: indexAddress,
  });

  return {
    search: async (query): Promise<readonly SearchResult[]> => {
      const hits = await Promise.resolve(client.search(query)).catch((error: unknown) => {
        if (!isUnavailableIndex(error)) {
          throw error;
        }

        throw new SearchError(
          {
            address: indexAddress,
          },
          {
            cause: error,
          },
        );
      });

      return hits.map(resultOf);
    },
  };
};
