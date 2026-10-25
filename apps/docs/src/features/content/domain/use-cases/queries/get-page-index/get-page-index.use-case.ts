import type { PagesQueryRepository } from '../../../contracts';

export type GetPageIndex = () => Promise<string>;

export const createGetPageIndex =
  (pages: PagesQueryRepository<unknown>): GetPageIndex =>
  (): Promise<string> =>
    pages.readIndex();
