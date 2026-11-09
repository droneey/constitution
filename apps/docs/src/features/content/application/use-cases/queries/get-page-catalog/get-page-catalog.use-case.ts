import type { PageCatalog } from '../../../../domain/page/entities';
import type { PageQueries } from '../../../contracts';

export type GetPageCatalog = () => Promise<PageCatalog>;

export const createGetPageCatalog =
  (pageQueries: PageQueries<unknown>): GetPageCatalog =>
  (): Promise<PageCatalog> =>
    pageQueries.readCatalog();
