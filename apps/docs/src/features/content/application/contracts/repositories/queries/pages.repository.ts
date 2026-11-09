import type { PageCatalog } from '../../../../domain/page/entities';
import type { PageSlugs } from '../../../../domain/page/value-objects';
import type { PageLookup } from '../../page-lookup.port';
import type { NavigationQueries } from './navigation.repository';

export interface PageQueries<TNavigation> extends PageLookup, NavigationQueries<TNavigation> {
  readonly findMarkdown: (slugs: PageSlugs) => Promise<string | undefined>;
  readonly readCatalog: () => Promise<PageCatalog>;
  readonly readFullText: () => Promise<string>;
  readonly readIndex: () => Promise<string>;
}
