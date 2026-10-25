import type { PageCatalog, PageSlugs } from '../../../entities';
import type { PageLookup } from '../../page-lookup.port';
import type { NavigationQueryRepository } from './navigation.repository';

/** `TNavigation` is the tree of every page, in the shape the site's layout renders, which the domain never reads */
export interface PagesQueryRepository<TNavigation>
  extends PageLookup,
    NavigationQueryRepository<TNavigation> {
  /** the page in Markdown for a language model; undefined when no page has these slugs */
  readonly findMarkdown: (slugs: PageSlugs) => Promise<string | undefined>;
  /** every page by its slugs, as the browser reads them to find a page */
  readonly readCatalog: () => Promise<PageCatalog>;
  /** every page in Markdown for a language model, as `llms-full.txt` holds them */
  readonly readFullText: () => Promise<string>;
  /** the address and title of every page, as `llms.txt` lists them */
  readonly readIndex: () => Promise<string>;
}
