import type { PageLocation } from '../../../domain/page/entities';
import type { PageBodyQueries } from '../../contracts';

export const createFakePageBodyQueries = (
  pages: readonly PageLocation[],
): PageBodyQueries<string> => ({
  find: (page) =>
    pages.some((held) => held.collection === page.collection && held.path === page.path)
      ? `body of ${page.collection}:${page.path}`
      : undefined,
});
