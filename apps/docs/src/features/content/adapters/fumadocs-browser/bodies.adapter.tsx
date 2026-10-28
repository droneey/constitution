import type { FC, ReactNode } from 'react';

import type { TOCItemType } from 'fumadocs-core/toc';
import type { CompiledMDXProperties } from 'fumadocs-mdx';
import { createClientLoader } from 'fumadocs-mdx/runtime/browser';
import type { MDXComponents } from 'mdx/types';

import { trackedForUse } from '#/libs/ui';

import type { PageBodiesQueryRepository } from '../../domain/contracts';
import type { PageLocation } from '../../domain/entities';
import { Page } from '../../domain/entities';

interface Loaded {
  toc: TOCItemType[];
}

interface BodyProps {
  components?: MDXComponents;
}

interface PageBody {
  body: FC<BodyProps>;
  /** the same promise on every call, which React's `use` reads at once when it has settled */
  load: () => Promise<Loaded>;
}

/** a collection's compiled files by their path, `./<path>`, as fumadocs-mdx's browser collections hold them */
interface BodyCollection {
  readonly raw: Readonly<Record<string, () => Promise<CompiledMDXProperties>>>;
}

const render = ({ default: Body }: CompiledMDXProperties, props: BodyProps): ReactNode => (
  <Body {...props} />
);

/** the bodies of the pages, each loaded once and kept, as React's `use` needs */
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
  /**
   * Read at once when settled, as the library's own renderer does: a page whose route loaded its body
   * renders whole in its first commit, so the router finds a heading the address names.
   */
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
