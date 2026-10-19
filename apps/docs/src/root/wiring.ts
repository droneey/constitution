import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';

import type { SerializedPageTree } from 'fumadocs-core/source/client';
import { z } from 'zod';

import type { DocsPageEntry } from '#/composition/docs';
import { pageBodyOf } from '#/features/content/adapters/fumadocs-browser';

import { slugsShape } from './constants';

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

interface DocsPageData {
  description: string;
  pageTree: SerializedPageTree;
  path: string;
  title: string;
  type: string;
}

type DocsPageRef = Pick<DocsPageData, 'description' | 'path' | 'title' | 'type'>;

interface DocsContent {
  /** read from the repository on the server */
  loadPage: (slugs: string[]) => Promise<DocsPageData>;
  /** throws not found when the collection has no body at the page's path */
  pageOf: (page: DocsPageRef) => DocsPageEntry & {
    preload: () => Promise<unknown>;
  };
}

interface RouterContext {
  docs: DocsContent;
}

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
