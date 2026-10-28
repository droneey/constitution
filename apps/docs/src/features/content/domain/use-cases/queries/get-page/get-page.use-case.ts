import type { PageLookup } from '../../../contracts';
import type { Page } from '../../../entities';
import type { PageSlugs } from '../../../value-objects';

/**
 * @throws {ExportError} when the site gives no list of the pages in time, or none it can read
 */
export type GetPage = (slugs: PageSlugs) => Promise<Page | undefined>;

export const createGetPage =
  (pages: PageLookup): GetPage =>
  (slugs: PageSlugs): Promise<Page | undefined> =>
    pages.find(slugs);
