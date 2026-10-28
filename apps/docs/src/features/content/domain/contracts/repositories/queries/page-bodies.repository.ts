import type { PageLocation } from '../../../entities';

export interface PageBodiesQueryRepository<TBody> {
  readonly find: (page: PageLocation) => TBody | undefined;
}
