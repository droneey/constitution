import type { PageLookup } from '../../../contracts';
import type { Page, PageSlugs } from '../../../entities';

/** undefined when no page has these slugs */
export type GetPage = (slugs: PageSlugs) => Promise<Page | undefined>;

export const createGetPage =
  (pages: PageLookup): GetPage =>
  (slugs: PageSlugs): Promise<Page | undefined> =>
    pages.find(slugs);
