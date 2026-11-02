import type { PageLocation } from '../../../../domain/page/entities';
import type { PageBodyQueries } from '../../../contracts';

export type GetPageBody<TBody> = (page: PageLocation) => TBody | undefined;

export const createGetPageBody =
  <TBody>(pageBodyQueries: PageBodyQueries<TBody>): GetPageBody<TBody> =>
  (page: PageLocation): TBody | undefined =>
    pageBodyQueries.find(page);
