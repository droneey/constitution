import type { Page } from '../../domain/page/entities';
import type { PageSlugs } from '../../domain/page/value-objects';

export interface PageLookup {
  /** @throws {ExportError} when the site gives no list of the pages in time, or none it can read */
  readonly find: (slugs: PageSlugs) => Promise<Page | undefined>;
}
