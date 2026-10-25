import type { PageLocation } from '../../../entities';

/** `TBody` is a page's compiled body, which the domain never reads */
export interface PageBodiesQueryRepository<TBody> {
  /** undefined when the page's collection holds no body at its path */
  readonly find: (page: PageLocation) => TBody | undefined;
}
