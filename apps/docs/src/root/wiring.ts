import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';

import type { SerializedPageTree } from 'fumadocs-core/source/client';
import { z } from 'zod';

import type { DocsPageEntry } from '#/composition/docs';
import { documentFrame } from '#/composition/docs/adapters/document';
import { createPageBodies } from '#/features/content/adapters/fumadocs-browser';
import type { GetVersions } from '#/features/versions';
import { createGetVersions, Version } from '#/features/versions';
import { createStaticFileVersionsRepository } from '#/features/versions/adapters/static-file';
import browserCollections from '#collections/browser';

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

const pageBodies = createPageBodies(browserCollections);

const routerContext: RouterContext = {
  docs: {
    loadPage: (slugs) =>
      serverLoader({
        data: slugs,
      }),
    pageOf: ({ description, path, title, type }) => {
      const body = pageBodies.pageBodyOf(type, path);

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

interface RootProviders {
  readonly builtVersion: Version;
  readonly frame: typeof documentFrame;
  readonly getVersions: GetVersions;
}

/** what the root route provides to every screen */
const rootProviders: RootProviders = {
  builtVersion: Version.create(import.meta.env.VITE_CONSTITUTION_VERSION),
  frame: documentFrame,
  getVersions: createGetVersions(
    createStaticFileVersionsRepository({
      address: '/versions.json',
    }),
  ),
};

export type { DocsPageData, RouterContext };
export { rootProviders, routerContext };
