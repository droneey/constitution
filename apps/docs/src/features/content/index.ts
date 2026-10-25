export { SearchPagesContext } from './app/providers';
export { useSearchPages } from './app/use-cases';
export type {
  PageBodiesQueryRepository,
  PageSearch,
  PagesQueryRepository,
  SearchIndex,
} from './domain/contracts';
export type { Page, PageCatalog, PageLocation, PageSlugs, SearchResult } from './domain/entities';
export { SearchResultKind, slugsOfMarkdownAddress } from './domain/entities';
export { SearchError, SearchFailure } from './domain/errors';
export type {
  GetFullText,
  GetNavigation,
  GetPage,
  GetPageBody,
  GetPageCatalog,
  GetPageIndex,
  GetPageMarkdown,
  GetSearchIndex,
  SearchPages,
} from './domain/use-cases';
export {
  createGetFullText,
  createGetNavigation,
  createGetPage,
  createGetPageBody,
  createGetPageCatalog,
  createGetPageIndex,
  createGetPageMarkdown,
  createGetSearchIndex,
  createSearchPages,
} from './domain/use-cases';
