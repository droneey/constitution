import type { PageLocation } from '../../../domain/page/entities';
import type { PageBodiesQueryRepository } from '../../contracts';

export const createFakePageBodiesRepository = (
  pages: readonly PageLocation[],
): PageBodiesQueryRepository<string> => ({
  find: (page) =>
    pages.some((held) => held.collection === page.collection && held.path === page.path)
      ? `body of ${page.collection}:${page.path}`
      : undefined,
});
