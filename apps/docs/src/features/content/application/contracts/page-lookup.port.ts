import type { Page } from '../../domain/entities';
import type { PageSlugs } from '../../domain/value-objects';

export interface PageLookup {
  /** @throws {ExportError} when the site gives no list of the pages in time, or none it can read */
  readonly find: (slugs: PageSlugs) => Promise<Page | undefined>;
}
