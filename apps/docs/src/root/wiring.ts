import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';

import type { SerializedPageTree } from 'fumadocs-core/source/client';
import { z } from 'zod';

import type { DocsPageEntry } from '#/composition/docs';
import { pageBodyOf } from '#/features/content/adapters/fumadocs-browser';

import { slugsShape } from './constants';

/** the collection a page's body lives in, by its name */
const collectionShape = z.string();

const serverLoader = createServerFn({
  method: 'GET',
})
  .validator(slugsShape)
  .middleware([
    staticFunctionMiddleware,
  ])
  .handler(async ({ data: slugs }) => {
    // the loader reads the repository, so only the server imports it
    const { collectionPathOf, contentSource } = await import(
      '#/features/content/adapters/fumadocs'
    );
    const source = contentSource();
    const page = source.getPage(slugs);

    if (page === undefined) {
      throw notFound();
    }

    return {
      description: page.data.description,
      pageTree: await source.serializePageTree(source.getPageTree()),
      path: collectionPathOf(page.path),
      title: page.data.title,
      type: collectionShape.parse(page.type),
    };
  });

/** a page of the documentation as its route loads it: the sidebar's tree, and where its body lives */
interface DocsPageData {
  description: string;
  pageTree: SerializedPageTree;
  path: string;
  title: string;
  type: string;
}

/** a loaded page, as its body is asked for */
type DocsPageRef = Pick<DocsPageData, 'description' | 'path' | 'title' | 'type'>;

interface DocsContent {
  /** the page at these slugs, read from the repository on the server */
  loadPage: (slugs: string[]) => Promise<DocsPageData>;
  /** a loaded page with its body, as its collection offers it; not found when the collection has none there */
  pageOf: (page: DocsPageRef) => DocsPageEntry & {
    preload: () => Promise<unknown>;
  };
}

/** what the routes' loaders and components reach through the router */
interface RouterContext {
  docs: DocsContent;
}

/** the program's wiring: the content the routes read, over the repository's collections */
const routerContext: RouterContext = {
  docs: {
    loadPage: (slugs) =>
      serverLoader({
        data: slugs,
      }),
    pageOf: ({ description, path, title, type }) => {
      const body = pageBodyOf(type, path);

      if (body === undefined) {
        throw notFound();
      }

      return {
        ...body,
        description,
        preload: body.load,
        title,
      };
    },
  },
};

export type { DocsPageData, RouterContext };
export { routerContext };
