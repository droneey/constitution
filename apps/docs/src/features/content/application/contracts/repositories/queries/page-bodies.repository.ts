import type { PageLocation } from '../../../../domain/entities';

export interface PageBodiesQueryRepository<TBody> {
  readonly find: (page: PageLocation) => TBody | undefined;
}
