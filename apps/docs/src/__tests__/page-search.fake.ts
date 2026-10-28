import type { PageSearch, SearchResult } from '#/features/content';

/** finds the results whose content holds the query, whatever its case */
export const createFakePageSearch = (results: readonly SearchResult[]): PageSearch => ({
  search: (query: string): Promise<readonly SearchResult[]> =>
    Promise.resolve(
      results.filter((found) => found.content.toLowerCase().includes(query.toLowerCase())),
    ),
});
