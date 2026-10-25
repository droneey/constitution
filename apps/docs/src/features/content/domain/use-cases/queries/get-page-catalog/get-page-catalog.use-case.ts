import type { PagesQueryRepository } from '../../../contracts';
import type { PageCatalog } from '../../../entities';

export type GetPageCatalog = () => Promise<PageCatalog>;

export const createGetPageCatalog =
  (pages: PagesQueryRepository<unknown>): GetPageCatalog =>
  (): Promise<PageCatalog> =>
    pages.readCatalog();
