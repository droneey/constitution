import type { PageLocation } from '../../../../domain/page/entities';

export interface PageBodiesQueryRepository<TBody> {
  readonly find: (page: PageLocation) => TBody | undefined;
}
