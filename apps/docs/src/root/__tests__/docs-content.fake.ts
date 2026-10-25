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
  loads: PageSlugs[];
  /** by collection and path */
  preloads: string[];
}

/**
 * One guide, one page the server lists after its body left its collection, and the tree; the guide's
 * body and the tree are kept once read, where React's `use` reads them, as the wiring keeps them
 */
const docsContentFake = (): DocsContentFake => {
  const loads: PageSlugs[] = [];
  const kept: {
    body?: Promise<Loaded>;
    navigation?: Promise<SerializedPageTree>;
  } = {};
  const preloads: string[] = [];
  const guide = pageFixture();
  const pages = new Map([
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
        collection === guide.collection && path === guide.path
          ? {
              body: (): undefined => undefined,
              load: () => {
                preloads.push(`${collection}:${path}`);
                kept.body ??= trackedForUse(
                  Promise.resolve({
                    toc: [],
                  }),
                );

                return kept.body;
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
