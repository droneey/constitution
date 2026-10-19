import { notFound } from '@tanstack/react-router';

import type { DocsPageEntry } from '#/composition/docs';

import type { DocsPageData, RouterContext } from '../wiring';

type DocsContent = RouterContext['docs'];

type DocsPageRef = Parameters<DocsContent['pageOf']>[0];

const pageDataFixture = (overrides: Partial<DocsPageData> = {}): DocsPageData => ({
  description: 'How a project adds blocks of its own.',
  pageTree: {
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
  },
  path: 'guides/write-a-pack.md',
  title: 'Write a pack',
  type: 'guide',
  ...overrides,
});

const loadedBody = Promise.resolve({
  toc: [],
});

interface DocsContentFake {
  docs: DocsContent;
  /** oldest first */
  loads: string[][];
  /** by collection and path */
  preloads: string[];
}

/** one guide, and one page the server lists after its body left its collection */
const docsContentFake = (): DocsContentFake => {
  const loads: string[][] = [];
  const preloads: string[] = [];
  const guide = pageDataFixture();
  const pages = new Map([
    [
      'guides/write-a-pack',
      guide,
    ],
    [
      'guides/moved',
      pageDataFixture({
        path: 'guides/moved.md',
        title: 'Moved',
      }),
    ],
  ]);

  return {
    docs: {
      loadPage: (slugs: string[]): Promise<DocsPageData> => {
        loads.push(slugs);
        const page = pages.get(slugs.join('/'));
        if (page === undefined) {
          throw notFound();
        }

        return Promise.resolve(page);
      },
      pageOf: ({ description, path, title, type }: DocsPageRef) => {
        if (type !== guide.type || path !== guide.path) {
          throw notFound();
        }
        const entry: DocsPageEntry = {
          body: (): undefined => undefined,
          description,
          load: () => loadedBody,
          loaded: (): undefined => undefined,
          title,
        };

        return {
          ...entry,
          preload: (): Promise<void> => {
            preloads.push(`${type}:${path}`);

            return Promise.resolve();
          },
        };
      },
    },
    loads,
    preloads,
  };
};

export type { DocsContentFake };
export { docsContentFake };
