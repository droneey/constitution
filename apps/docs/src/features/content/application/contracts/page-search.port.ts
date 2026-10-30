import type { SearchResult } from '../../domain/entities';

export interface PageSearch {
  /** @throws {SearchError} when the index of the pages cannot be read */
  readonly search: (query: string) => Promise<readonly SearchResult[]>;
}
