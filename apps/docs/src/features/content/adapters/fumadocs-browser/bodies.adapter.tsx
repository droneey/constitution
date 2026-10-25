import type { FC, ReactNode } from 'react';

import type { TOCItemType } from 'fumadocs-core/toc';
import type { CompiledMDXProperties } from 'fumadocs-mdx';
import { createClientLoader } from 'fumadocs-mdx/runtime/browser';
import type { MDXComponents } from 'mdx/types';

interface Loaded {
  toc: TOCItemType[];
}

interface BodyProps {
  components?: MDXComponents;
}

interface PageBody {
  body: FC<BodyProps>;
  load: () => Promise<Loaded>;
  loaded: () => Loaded | undefined;
}

/** a collection's compiled files by their path, `./<path>`, as fumadocs-mdx's browser collections hold them */
interface BodyCollection {
  readonly raw: Readonly<Record<string, () => Promise<CompiledMDXProperties>>>;
}

interface PageBodies {
  readonly pageBodyOf: (type: string, path: string) => PageBody | undefined;
}

const render = ({ default: Body }: CompiledMDXProperties, props: BodyProps): ReactNode => (
  <Body {...props} />
);

/** the bodies of the pages, each loaded once and kept, as React's `use` needs */
const createPageBodies = (collections: Readonly<Record<string, BodyCollection>>): PageBodies => {
  const loaders = new Map(
    Object.entries(collections).map(([type, collection]) => [
      type,
      {
        loader: createClientLoader(collection.raw, {
          component: render,
          id: type,
        }),
        raw: collection.raw,
      },
    ]),
  );
  const loadings = new Map<string, Promise<Loaded>>();

  /**
   * Read at once, as the library's own renderer does: a page whose route loaded its body renders whole
   * in its first commit, so the router finds a heading the address names.
   */
  const loadedBodies = new Map<string, Loaded>();

  const pageBodyOf = (type: string, path: string): PageBody | undefined => {
    const bodies = loaders.get(type);
    const key = `${type}:${path}`;

    if (bodies === undefined || !Object.hasOwn(bodies.raw, `./${path}`)) {
      return undefined;
    }

    const load = (): Promise<Loaded> => {
      const started =
        loadings.get(key) ??
        bodies.loader.preload(path).then((loaded) => {
          loadedBodies.set(key, loaded);

          return loaded;
        });

      loadings.set(key, started);

      return started;
    };

    return {
      body: bodies.loader.getComponent(path),
      load,
      loaded: () => loadedBodies.get(key),
    };
  };

  return {
    pageBodyOf,
  };
};

export { createPageBodies };
