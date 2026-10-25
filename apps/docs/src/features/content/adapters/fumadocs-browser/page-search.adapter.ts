import type { SortedResult } from 'fumadocs-core/search';
import { staticClient } from 'fumadocs-core/search/client/orama-static';

import type { PageSearch } from '../../domain/contracts';
import type { SearchResult } from '../../domain/entities';
import { SearchResultKind } from '../../domain/entities';
import { SearchError } from '../../domain/errors';

interface StaticPageSearchInput {
  /** where the site serves the index its server exported */
  readonly address: string;
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
 * Searches in the browser the index the site's server exported, downloaded once on the first search;
 * Fumadocs keeps it for the page's life, by its address.
 */
export const createStaticPageSearch = ({ address }: StaticPageSearchInput): PageSearch => {
  const client = staticClient({
    from: address,
  });

  return {
    search: async (query): Promise<readonly SearchResult[]> => {
      const hits = await Promise.resolve(client.search(query)).catch((error: unknown) => {
        throw new SearchError(
          {
            address,
          },
          // Stryker disable next-line ObjectLiteral: the cause only explains the failure in a trace
          {
            cause: error,
          },
        );
      });

      return hits.map(resultOf);
    },
  };
};
