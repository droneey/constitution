import type { PagesQueryRepository } from '../../../contracts';

export type GetFullText = () => Promise<string>;

export const createGetFullText =
  (pages: PagesQueryRepository<unknown>): GetFullText =>
  (): Promise<string> =>
    pages.readFullText();
