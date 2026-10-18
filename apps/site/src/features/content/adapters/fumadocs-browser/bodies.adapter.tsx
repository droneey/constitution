// Stryker disable all: it loads the collections fumadocs-mdx generates at build time, which no spec can load; the site's build proves it
import type { FC, ReactNode } from 'react';

import type { TOCItemType } from 'fumadocs-core/toc';
import type { CompiledMDXProperties } from 'fumadocs-mdx';
import type { MDXComponents } from 'mdx/types';

import browserCollections from '#collections/browser';

/** a body once loaded: the outline of its headings */
interface Loaded {
  toc: TOCItemType[];
}

/** what a page's body takes: the components its Markdown renders with */
interface BodyProps {
  components?: MDXComponents;
}

/** a page's body as the browser loads it: its component, and its loading, which gives its outline */
interface PageBody {
  body: FC<BodyProps>;
  load: () => Promise<Loaded>;
}

/** the bodies of one collection, by their paths in it */
interface Bodies {
  loader: {
    getComponent: (path: string) => FC<BodyProps>;
    preload: (path: string) => Promise<Loaded>;
  };
  raw: Readonly<Record<string, unknown>>;
}

const render = ({ default: Body }: CompiledMDXProperties, props: BodyProps): ReactNode => (
  <Body {...props} />
);

const COLLECTIONS: ReadonlyMap<string, Bodies> = new Map([
  [
    'blocks',
    {
      loader: browserCollections.blocks.createClientLoader({
        component: render,
      }),
      raw: browserCollections.blocks.raw,
    },
  ],
  [
    'documents',
    {
      loader: browserCollections.documents.createClientLoader({
        component: render,
      }),
      raw: browserCollections.documents.raw,
    },
  ],
  [
    'glossary',
    {
      loader: browserCollections.glossary.createClientLoader({
        component: render,
      }),
      raw: browserCollections.glossary.raw,
    },
  ],
  [
    'guide',
    {
      loader: browserCollections.guide.createClientLoader({
        component: render,
      }),
      raw: browserCollections.guide.raw,
    },
  ],
  [
    'overview',
    {
      loader: browserCollections.overview.createClientLoader({
        component: render,
      }),
      raw: browserCollections.overview.raw,
    },
  ],
  [
    'quickStart',
    {
      loader: browserCollections.quickStart.createClientLoader({
        component: render,
      }),
      raw: browserCollections.quickStart.raw,
    },
  ],
]);

/** the loading of each body, by its collection and path, so a render that asks again waits on the same */
const loadings = new Map<string, Promise<Loaded>>();

/** a body's loading, started once and kept, as React's `use` needs */
const loadingOf = (type: string, path: string, bodies: Bodies): Promise<Loaded> => {
  const key = `${type}:${path}`;
  const started = loadings.get(key) ?? bodies.loader.preload(path);

  loadings.set(key, started);

  return started;
};

/** the body of the page at this path of this collection, when the collection holds it */
const pageBodyOf = (type: string, path: string): PageBody | undefined => {
  const bodies = COLLECTIONS.get(type);

  if (bodies === undefined || !Object.hasOwn(bodies.raw, `./${path}`)) {
    return undefined;
  }

  return {
    body: bodies.loader.getComponent(path),
    load: () => loadingOf(type, path, bodies),
  };
};

export type { PageBody };
export { pageBodyOf };
