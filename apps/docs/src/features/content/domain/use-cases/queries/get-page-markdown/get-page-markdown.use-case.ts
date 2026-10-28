import type { PagesQueryRepository } from '../../../contracts';
import type { PageSlugs } from '../../../value-objects';

export type GetPageMarkdown = (slugs: PageSlugs) => Promise<string | undefined>;

export const createGetPageMarkdown =
  (pages: PagesQueryRepository<unknown>): GetPageMarkdown =>
  (slugs: PageSlugs): Promise<string | undefined> =>
    pages.findMarkdown(slugs);
