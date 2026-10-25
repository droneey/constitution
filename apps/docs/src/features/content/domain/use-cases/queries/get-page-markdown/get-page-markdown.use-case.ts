import type { PagesQueryRepository } from '../../../contracts';
import type { PageSlugs } from '../../../entities';

/** undefined when no page has these slugs */
export type GetPageMarkdown = (slugs: PageSlugs) => Promise<string | undefined>;

export const createGetPageMarkdown =
  (pages: PagesQueryRepository<unknown>): GetPageMarkdown =>
  (slugs: PageSlugs): Promise<string | undefined> =>
    pages.findMarkdown(slugs);
