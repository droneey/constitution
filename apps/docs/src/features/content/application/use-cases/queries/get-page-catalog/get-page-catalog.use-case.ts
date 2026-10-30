import type { PageCatalog } from '../../../../domain/page/entities';
import type { PagesQueryRepository } from '../../../contracts';

export type GetPageCatalog = () => Promise<PageCatalog>;

export const createGetPageCatalog =
  (pages: PagesQueryRepository<unknown>): GetPageCatalog =>
  (): Promise<PageCatalog> =>
    pages.readCatalog();
