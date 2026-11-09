import type { PageQueries } from '../../../contracts';

export type GetFullText = () => Promise<string>;

export const createGetFullText =
  (pageQueries: PageQueries<unknown>): GetFullText =>
  (): Promise<string> =>
    pageQueries.readFullText();
