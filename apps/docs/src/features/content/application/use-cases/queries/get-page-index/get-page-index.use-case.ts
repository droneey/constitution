import type { PageQueries } from '../../../contracts';

export type GetPageIndex = () => Promise<string>;

export const createGetPageIndex =
  (pageQueries: PageQueries<unknown>): GetPageIndex =>
  (): Promise<string> =>
    pageQueries.readIndex();
