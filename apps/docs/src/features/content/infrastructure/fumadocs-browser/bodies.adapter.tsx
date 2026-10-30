import type { FC, ReactNode } from 'react';

import type { TOCItemType } from 'fumadocs-core/toc';
import type { CompiledMDXProperties } from 'fumadocs-mdx';
import { createClientLoader } from 'fumadocs-mdx/runtime/browser';
import type { MDXComponents } from 'mdx/types';

import { trackedForUse } from '#/libs/ui';

import type { PageBodiesQueryRepository } from '../../application/contracts';
import type { PageLocation } from '../../domain/page/entities';
import { Page } from '../../domain/page/entities';

interface Loaded {
  toc: TOCItemType[];
}

interface BodyProps {
  components?: MDXComponents;
}

interface PageBody {
  body: FC<BodyProps>;
  // Why: React's `use` suspends on every new promise, so each call gives the same one.
  load: () => Promise<Loaded>;
}

interface BodyCollection {
  readonly raw: Readonly<Record<string, () => Promise<CompiledMDXProperties>>>;
}

const render = ({ default: Body }: CompiledMDXProperties, props: BodyProps): ReactNode => (
  <Body {...props} />
);

const createPageBodies = (
  collections: Readonly<Record<string, BodyCollection>>,
): PageBodiesQueryRepository<PageBody> => {
  const loadersByCollection = new Map(
    Object.entries(collections).map(([collectionName, collection]) => [
      collectionName,
      {
        loader: createClientLoader(collection.raw, {
          component: render,
          id: collectionName,
        }),
        raw: collection.raw,
      },
    ]),
  );
  // Why: read at once when settled, as the library's own renderer does: a page whose route loaded
  // its body renders whole in its first commit, so the router finds a heading the address names.
  const loadings = new Map<string, Promise<Loaded>>();

  const find = (page: PageLocation): PageBody | undefined => {
    const { collection, path } = page;
    const collectionLoader = loadersByCollection.get(collection);

    if (collectionLoader === undefined || !Object.hasOwn(collectionLoader.raw, `./${path}`)) {
      return undefined;
    }

    const load = (): Promise<Loaded> => {
      const started =
        loadings.get(Page.keyOf(page)) ?? trackedForUse(collectionLoader.loader.preload(path));

      loadings.set(Page.keyOf(page), started);

      return started;
    };

    return {
      body: collectionLoader.loader.getComponent(path),
      load,
    };
  };

  return {
    find,
  };
};

export type { PageBody };
export { createPageBodies };
