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
import { once } from '#/libs/once';
import { trackedForUse } from '#/libs/ui';
import { DOCS_ROUTE } from '#/shared/constants';
import browserCollections from '#collections/browser';

/** the use cases that read the repository, which only the server builds */
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

/** at the host's root, beside every release's site, so a release's site learns of each later one */
const VERSIONS_ADDRESS = '/versions.json';

/** built once, on the server alone: the client bundle never holds the adapters that read the repository */
const serverContent = createServerOnlyFn(
  once(
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

/**
 * Start's own guard of server functions against cross-site calls, which it adds only to a program
 * that declares no middleware of its own
 */
const serverFunctionsCsrfMiddleware = createCsrfMiddleware({
  filter: ({ handlerType }) => handlerType === 'serverFn',
});

const startInstance = createStart(() => ({
  requestMiddleware: [
    serverFunctionsCsrfMiddleware,
    serverContentMiddleware,
  ],
}));

/**
 * What the browser reads of the site's server, as plain files the site prerenders: the tree every
 * page shares, and the list of the pages, which no page's own data holds
 */
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
  /** throws not found when no page has the slugs */
  readonly getPage: (slugs: PageSlugs) => Promise<Page>;
  readonly getPageBody: GetPageBody<PageBody>;
  /**
   * The same promise on every call, which React's `use` reads at once when it has settled, kept
   * for the server's life and in the browser for the tab's
   */
  readonly loadNavigation: () => Promise<SerializedPageTree>;
}

interface RouterContext {
  docs: DocsContent;
}

const routerContext: RouterContext = {
  docs: {
    getPage: async (slugs) => {
      const page = await findPage(slugs);

      if (page === undefined) {
        throw notFound();
      }

      return page;
    },
    getPageBody: createGetPageBody(createPageBodies(browserCollections)),
    loadNavigation: once(() => trackedForUse(readNavigation())),
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
