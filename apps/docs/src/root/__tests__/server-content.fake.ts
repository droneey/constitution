import type { SerializedPageTree } from 'fumadocs-core/source/client';

import type {
  GetFullText,
  GetNavigation,
  GetPage,
  GetPageCatalog,
  GetPageIndex,
  GetPageMarkdown,
  GetSearchIndex,
} from '#/features/content';

/** the use cases the request middleware hands the server's handlers */
interface ServerContent {
  readonly getFullText: GetFullText;
  readonly getNavigation: GetNavigation<SerializedPageTree>;
  readonly getPage: GetPage;
  readonly getPageCatalog: GetPageCatalog;
  readonly getPageIndex: GetPageIndex;
  readonly getPageMarkdown: GetPageMarkdown;
  readonly getSearchIndex: GetSearchIndex;
}

/** what the fake serves: the overview and one guide */
const SERVED = {
  navigation: {
    // biome-ignore lint/style/useNamingConvention: Fumadocs marks a serialized page tree by this key
    $fumadocs_loader: 'page-tree',
    data: {
      children: [],
      name: 'Constitution',
    },
  },
  fullText: '# Overview (/docs)\n\n# Write a pack (/docs/guides/write-a-pack)',
  guide: '# Write a pack (/docs/guides/write-a-pack)',
  overview: '# Overview (/docs)',
  pageCatalog: {
    'guides/write-a-pack': {
      collection: 'guide',
      description: 'How a project adds blocks of its own.',
      path: 'guides/write-a-pack.md',
      title: 'Write a pack',
    },
  },
  pageIndex: '- [Overview](/docs)\n- [Write a pack](/docs/guides/write-a-pack)',
  searchIndex: {
    ids: [
      '/docs',
      '/docs/guides/write-a-pack',
    ],
  },
} as const;

/** by the slugs joined */
const markdownBySlugs = new Map([
  [
    '',
    SERVED.overview,
  ],
  [
    'guides/write-a-pack',
    SERVED.guide,
  ],
]);

const serverContentFake = (): ServerContent => ({
  getFullText: () => Promise.resolve(SERVED.fullText),
  getNavigation: () => Promise.resolve(SERVED.navigation),
  getPage: () => Promise.resolve(undefined),
  getPageCatalog: () => Promise.resolve(SERVED.pageCatalog),
  getPageIndex: () => Promise.resolve(SERVED.pageIndex),
  getPageMarkdown: (slugs) => Promise.resolve(markdownBySlugs.get(slugs.join('/'))),
  getSearchIndex: () => Promise.resolve(SERVED.searchIndex),
});

export { SERVED, serverContentFake };
