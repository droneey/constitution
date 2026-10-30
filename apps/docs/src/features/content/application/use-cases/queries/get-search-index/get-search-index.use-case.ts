import type { SearchIndex } from '../../../contracts';

export type GetSearchIndex = () => Promise<unknown>;

export const createGetSearchIndex =
  (index: SearchIndex): GetSearchIndex =>
  (): Promise<unknown> =>
    index.export();
