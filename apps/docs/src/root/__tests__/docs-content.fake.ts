import { notFound } from '@tanstack/react-router';

import type { SerializedPageTree } from 'fumadocs-core/source/client';

import type { Page, PageLocation, PageSlugs } from '#/features/content';
import type { PageBody } from '#/features/content/adapters/fumadocs-browser';
import { trackedForUse } from '#/libs/ui';

import type { RouterContext } from '../wiring';

type DocsContent = RouterContext['docs'];

type Loaded = Awaited<ReturnType<PageBody['load']>>;

const pageFixture = (overrides: Partial<Page> = {}): Page => ({
  collection: 'guide',
  description: 'How a project adds blocks of its own.',
  path: 'guides/write-a-pack.md',
  title: 'Write a pack',
  ...overrides,
});

/** made anew for each fake, since rendering the tree turns its names into elements in place */
const navigationFixture = (): SerializedPageTree => ({
  // biome-ignore lint/style/useNamingConvention: Fumadocs marks a serialized page tree by this key
  $fumadocs_loader: 'page-tree',
  data: {
    children: [
      {
        name: 'Overview',
        type: 'page',
        url: '/docs',
      },
      {
        name: 'Write a pack',
        type: 'page',
        url: '/docs/guides/write-a-pack',
      },
    ],
    name: 'Constitution',
  },
});

interface DocsContentFake {
  docs: DocsContent;
  /** oldest first */
  loads: (readonly string[])[];
  /** by collection and path */
  preloads: string[];
}

/**
 * The overview, the quick start, one guide and one page the server lists after its body left its
 * collection, and the tree; each body and the tree are kept once read, where React's `use` reads
 * them, as the wiring keeps them
 */
const docsContentFake = (): DocsContentFake => {
  const loads: (readonly string[])[] = [];
  const keptBodies = new Map<string, Promise<Loaded>>();
  const kept: {
    navigation?: Promise<SerializedPageTree>;
  } = {};
  const preloads: string[] = [];
  // both of the README, as the site's collections hold them
  const overview = pageFixture({
    collection: 'overview',
    description: 'The rules a repository is built by.',
    path: 'README.md',
    title: 'Overview',
  });
  const quickStart = pageFixture({
    collection: 'quickStart',
    description: 'Adopt the Constitution in a project.',
    path: 'README.md',
    title: 'Quick start',
  });
  const guide = pageFixture();
  const withBodies = [
    overview,
    quickStart,
    guide,
  ];
  const pages = new Map([
    [
      '',
      overview,
    ],
    [
      'quick-start',
      quickStart,
    ],
    [
      'guides/write-a-pack',
      guide,
    ],
    [
      'guides/moved',
      pageFixture({
        path: 'guides/moved.md',
        title: 'Moved',
      }),
    ],
  ]);

  return {
    docs: {
      getPage: (slugs: PageSlugs): Promise<Page> => {
        loads.push(slugs);

        const page = pages.get(slugs.join('/'));

        if (page === undefined) {
          throw notFound();
        }

        return Promise.resolve(page);
      },
      getPageBody: ({ collection, path }: PageLocation): PageBody | undefined =>
        withBodies.some((page) => page.collection === collection && page.path === path)
          ? {
              body: (): undefined => undefined,
              load: () => {
                const key = `${collection}:${path}`;
                const body =
                  keptBodies.get(key) ??
                  trackedForUse(
                    Promise.resolve({
                      toc: [],
                    }),
                  );

                preloads.push(key);
                keptBodies.set(key, body);

                return body;
              },
            }
          : undefined,
      loadNavigation: () => {
        kept.navigation ??= trackedForUse(Promise.resolve(navigationFixture()));

        return kept.navigation;
      },
    },
    loads,
    preloads,
  };
};

export type { DocsContentFake };
export { docsContentFake, navigationFixture };
