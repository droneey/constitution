import type { PageBodiesQueryRepository } from '../../contracts';
import type { PageLocation } from '../../entities';

/** a page's body is the name of its file, for the pages it holds */
export const createFakePageBodiesRepository = (
  pages: readonly PageLocation[],
): PageBodiesQueryRepository<string> => ({
  find: (page) =>
    pages.some((held) => held.collection === page.collection && held.path === page.path)
      ? `body of ${page.collection}:${page.path}`
      : undefined,
});
