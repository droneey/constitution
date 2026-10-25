import type { PageSearch } from '../../../contracts';
import type { SearchResult } from '../../../entities';

/** @throws {@link SearchError} when the index of the pages cannot be read */
export type SearchPages = (query: string) => Promise<readonly SearchResult[]>;

export const createSearchPages =
  (pageSearch: PageSearch): SearchPages =>
  (query: string): Promise<readonly SearchResult[]> =>
    pageSearch.search(query);
