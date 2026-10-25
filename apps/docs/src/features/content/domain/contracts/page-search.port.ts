import type { SearchResult } from '../entities';

export interface PageSearch {
  /** @throws {@link SearchError} when the index of the pages cannot be read */
  readonly search: (query: string) => Promise<readonly SearchResult[]>;
}
