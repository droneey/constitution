import type { PageCatalog } from '../../../../domain/entities';
import type { PageSlugs } from '../../../../domain/value-objects';
import type { PageLookup } from '../../page-lookup.port';
import type { NavigationQueryRepository } from './navigation.repository';

export interface PagesQueryRepository<TNavigation>
  extends PageLookup,
    NavigationQueryRepository<TNavigation> {
  readonly findMarkdown: (slugs: PageSlugs) => Promise<string | undefined>;
  readonly readCatalog: () => Promise<PageCatalog>;
  readonly readFullText: () => Promise<string>;
  readonly readIndex: () => Promise<string>;
}
