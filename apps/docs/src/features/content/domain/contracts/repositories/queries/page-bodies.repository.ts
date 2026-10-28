import type { PageLocation } from '../../../entities';

/** `TBody` is a page's compiled body, which the domain never reads */
export interface PageBodiesQueryRepository<TBody> {
  readonly find: (page: PageLocation) => TBody | undefined;
}
