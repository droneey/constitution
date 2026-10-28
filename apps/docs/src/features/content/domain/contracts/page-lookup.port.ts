import type { Page } from '../entities';
import type { PageSlugs } from '../value-objects';

export interface PageLookup {
  /** @throws {@link ExportError} when the site gives no list of the pages in time, or none it can read */
  readonly find: (slugs: PageSlugs) => Promise<Page | undefined>;
}
