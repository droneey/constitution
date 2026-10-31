import type { PageLocation } from '../../../../domain/page/entities';
import type { PageBodiesQueryRepository } from '../../../contracts';

export type GetPageBody<TBody> = (page: PageLocation) => TBody | undefined;

export const createGetPageBody =
  <TBody>(bodies: PageBodiesQueryRepository<TBody>): GetPageBody<TBody> =>
  (page: PageLocation): TBody | undefined =>
    bodies.find(page);
