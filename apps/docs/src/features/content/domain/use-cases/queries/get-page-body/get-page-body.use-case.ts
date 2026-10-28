import type { PageBodiesQueryRepository } from '../../../contracts';
import type { PageLocation } from '../../../entities';

export type GetPageBody<TBody> = (page: PageLocation) => TBody | undefined;

export const createGetPageBody =
  <TBody>(bodies: PageBodiesQueryRepository<TBody>): GetPageBody<TBody> =>
  (page: PageLocation): TBody | undefined =>
    bodies.find(page);
