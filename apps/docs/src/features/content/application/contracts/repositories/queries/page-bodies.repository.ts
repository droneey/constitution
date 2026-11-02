import type { PageLocation } from '../../../../domain/page/entities';

export interface PageBodyQueries<TBody> {
  readonly find: (page: PageLocation) => TBody | undefined;
}
