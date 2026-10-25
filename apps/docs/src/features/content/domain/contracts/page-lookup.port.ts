import type { Page, PageSlugs } from '../entities';

export interface PageLookup {
  /**
   * undefined when no page has these slugs
   * @throws {@link ExportError} when the list of the pages cannot be read
   */
  readonly find: (slugs: PageSlugs) => Promise<Page | undefined>;
}
