import type { PageSearch, SearchResult } from '#/features/content';

/** finds the results whose content holds the query, whatever its case; a failure fails every search */
export const createFakePageSearch = (answer: readonly SearchResult[] | Error): PageSearch => ({
  search: (query: string): Promise<readonly SearchResult[]> =>
    answer instanceof Error
      ? Promise.reject(answer)
      : Promise.resolve(
          answer.filter((found) => found.content.toLowerCase().includes(query.toLowerCase())),
        ),
});
