import type { PageBodiesQueryRepository } from '../../../contracts';
import type { PageLocation } from '../../../entities';

/** undefined when the page's collection holds no body at its path */
export type GetPageBody<TBody> = (page: PageLocation) => TBody | undefined;

export const createGetPageBody =
  <TBody>(bodies: PageBodiesQueryRepository<TBody>): GetPageBody<TBody> =>
  (page: PageLocation): TBody | undefined =>
    bodies.find(page);
