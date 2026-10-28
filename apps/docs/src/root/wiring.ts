import { notFound } from '@tanstack/react-router';
import {
  createCsrfMiddleware,
  createIsomorphicFn,
  createMiddleware,
  createServerOnlyFn,
  createStart,
} from '@tanstack/react-start';

import type { SerializedPageTree } from 'fumadocs-core/source/client';

import type { IsScreenNarrow, MarkSidebar } from '#/composition/docs';
import { createIsScreenNarrow, createMarkSidebar } from '#/composition/docs';
import { documentFrame } from '#/composition/docs/adapters/document';
import type {
  GetFullText,
  GetNavigation,
  GetPage,
  GetPageBody,
  GetPageCatalog,
  GetPageIndex,
  GetPageMarkdown,
  GetSearchIndex,
  Page,
  PageSlugs,
  SearchPages,
} from '#/features/content';
import {
  createGetFullText,
  createGetNavigation,
  createGetPage,
  createGetPageBody,
  createGetPageCatalog,
  createGetPageIndex,
  createGetPageMarkdown,
  createGetSearchIndex,
  createSearchPages,
  SiteBasePath,
} from '#/features/content';
import type { PageBody } from '#/features/content/adapters/fumadocs-browser';
import {
  createPageBodies,
  createStaticExports,
  createStaticPageSearch,
} from '#/features/content/adapters/fumadocs-browser';
import type { GetVersions } from '#/features/versions';
import { createGetVersions, Version } from '#/features/versions';
import { createStaticFileVersionsRepository } from '#/features/versions/adapters/static-file';
import { onceSucceeded } from '#/libs/once-succeeded';
import { trackedForUse } from '#/libs/ui';
import { DOCS_ROUTE } from '#/shared/constants';
import browserCollections from '#collections/browser';

interface ServerContent {
  readonly getFullText: GetFullText;
  readonly getNavigation: GetNavigation<SerializedPageTree>;
  readonly getPage: GetPage;
  readonly getPageCatalog: GetPageCatalog;
  readonly getPageIndex: GetPageIndex;
  readonly getPageMarkdown: GetPageMarkdown;
  readonly getSearchIndex: GetSearchIndex;
}

const siteBasePath = SiteBasePath.create(import.meta.env.BASE_URL);

const searchIndexAddress = `${siteBasePath}api/search`;

const navigationAddress = `${siteBasePath}api/navigation`;

const pageCatalogAddress = `${siteBasePath}api/pages`;

// Why: at the host's root, beside every release's site, so a release's site learns of each later
// one.
const VERSIONS_ADDRESS = '/versions.json';

// Why: built once, on the server alone: the client bundle never holds the adapters that read the
// repository.
const serverContent = createServerOnlyFn(
  onceSucceeded(
    (): Promise<ServerContent> =>
      Promise.all([
        import('#/features/content/adapters/fumadocs'),
        import('#/features/content/adapters/fumadocs-mdx'),
        import('#collections/server'),
      ]).then(([{ createFumadocsContent }, { siteLayoutOf }, collections]) => {
        const content = createFumadocsContent({
          collections,
          layout: siteLayoutOf(DOCS_ROUTE),
          siteBasePath,
        });

        return {
          getFullText: createGetFullText(content),
          getNavigation: createGetNavigation(content),
          getPage: createGetPage(content),
          getPageCatalog: createGetPageCatalog(content),
          getPageIndex: createGetPageIndex(content),
          getPageMarkdown: createGetPageMarkdown(content),
          getSearchIndex: createGetSearchIndex(content),
        };
      }),
  ),
);

const serverContentMiddleware = createMiddleware().server(async ({ next }) =>
  next({
    context: await serverContent(),
  }),
);

// Why: Start adds its own guard of server functions against cross-site calls only to a program that
// declares no middleware of its own.
const serverFunctionsCsrfMiddleware = createCsrfMiddleware({
  filter: ({ handlerType }) => handlerType === 'serverFn',
});

const startInstance = createStart(() => ({
  requestMiddleware: [
    serverFunctionsCsrfMiddleware,
    serverContentMiddleware,
  ],
}));

const staticExports = createStaticExports({
  catalogAddress: pageCatalogAddress,
  navigationAddress,
});

const findPage = createIsomorphicFn()
  .server(
    async (slugs: PageSlugs): Promise<Page | undefined> => (await serverContent()).getPage(slugs),
  )
  .client(createGetPage(staticExports));

const readNavigation = createIsomorphicFn()
  .server(async (): Promise<SerializedPageTree> => (await serverContent()).getNavigation())
  .client(createGetNavigation(staticExports));

interface DocsContent {
  /**
   * @throws {NotFoundError} when no page has the slugs
   * @throws {ExportError} when the site gives no list of the pages in time, or none it can read
   */
  readonly getPage: (slugs: PageSlugs) => Promise<Page>;
  readonly getPageBody: GetPageBody<PageBody>;
  // Why: React's `use` suspends on every new promise, so each call gives the same one, kept for the
  // server's life and in the browser for the tab's.
  /** @throws {ExportError} when the site gives no tree in time, or none it can read */
  readonly loadNavigation: () => Promise<SerializedPageTree>;
}

interface RouterContext {
  docs: DocsContent;
}

const routerContext: RouterContext = {
  docs: {
    /**
     * @throws {NotFoundError} when no page has the slugs
     * @throws {ExportError} when the site gives no list of the pages in time, or none it can read
     */
    getPage: async (slugs) => {
      const page = await findPage(slugs);

      if (page === undefined) {
        throw notFound();
      }

      return page;
    },
    getPageBody: createGetPageBody(createPageBodies(browserCollections)),
    loadNavigation: onceSucceeded(() => trackedForUse(readNavigation())),
  },
};

interface RootProviders {
  readonly builtVersion: Version;
  readonly getVersions: GetVersions;
  readonly isScreenNarrow: IsScreenNarrow;
  readonly markSidebar: MarkSidebar;
  readonly searchPages: SearchPages;
}

const rootProviders: RootProviders = {
  builtVersion: Version.create(import.meta.env.VITE_CONSTITUTION_VERSION),
  getVersions: createGetVersions(
    createStaticFileVersionsRepository({
      address: VERSIONS_ADDRESS,
    }),
  ),
  isScreenNarrow: createIsScreenNarrow(documentFrame),
  markSidebar: createMarkSidebar(documentFrame),
  searchPages: createSearchPages(
    createStaticPageSearch({
      indexAddress: searchIndexAddress,
    }),
  ),
};

export type { RouterContext };
export { rootProviders, routerContext, startInstance };
