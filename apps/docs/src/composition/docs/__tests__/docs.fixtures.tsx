import type { ReactElement, ReactNode } from 'react';

import type { RenderResult } from '@testing-library/react';
import { act, render } from '@testing-library/react';
import { FrameworkProvider } from 'fumadocs-core/framework';
import { RootProvider } from 'fumadocs-ui/provider/base';
import { renderToString } from 'react-dom/server';

import { createFakeGetVersions } from '#/__tests__/get-versions.fake';
import { createFakePageSearch } from '#/__tests__/page-search.fake';
import type { SearchPages } from '#/features/content';
import { createSearchPages, SearchPagesContext } from '#/features/content';
import type { GetVersions, Versions } from '#/features/versions';
import { GetVersionsContext, Version } from '#/features/versions';
import type { mdxComponents, PageTreeRoot, TocHeading } from '#/libs/ui';
import { trackedForUse } from '#/libs/ui';

import { DocsBuiltVersionContext } from '../app/providers';
import { IsScreenNarrowContext, MarkSidebarContext } from '../app/use-cases';
import type { DocumentFrame } from '../domain/contracts';
import { createIsScreenNarrow, createMarkSidebar } from '../domain/use-cases';
import type { DocsPageEntry } from '../ui/screens';
import { DocsSearchWidget } from '../ui/widgets';

interface DocsProviders {
  frame?: DocumentFrame;
  /** read on every render, as the search is */
  getVersions?: GetVersions | undefined;
  pathname?: string;
  release?: Version | undefined;
  /** read on every render, so a rerender takes the one set since */
  searchPages?: SearchPages | undefined;
}

const noParams = (): Record<string, string> => ({});

const staticRouter = (): {
  push: () => void;
  refresh: () => void;
} => ({
  push: (): void => undefined,
  refresh: (): void => undefined,
});

const versionsFixture = (overrides: Partial<Versions> = {}): Versions => ({
  latest: Version.create('0.70.0'),
  versions: [
    Version.create('0.70.0'),
    Version.create('0.69.2'),
  ],
  ...overrides,
});

const pageTreeFixture = (): PageTreeRoot => ({
  name: 'Constitution',
  children: [
    {
      type: 'page',
      name: 'Overview',
      url: '/docs',
    },
    {
      type: 'page',
      name: 'Write a pack',
      url: '/docs/guides/write-a-pack',
    },
  ],
});

const tocFixture = (): TocHeading[] => [
  {
    depth: 2,
    title: 'Placement',
    url: '#placement',
  },
  {
    depth: 3,
    title: 'Layer',
    url: '#layer',
  },
  {
    depth: 4,
    title: 'Axis',
    url: '#axis',
  },
];

/** loads a body with no headings whose loading has ended where React's `use` reads it, as a route's loader leaves it */
const settledLoad = async (): Promise<DocsPageEntry['load']> => {
  const body = trackedForUse(
    Promise.resolve({
      toc: [],
    }),
  );

  await body;

  return () => body;
};

/** its contents already loaded */
const pageEntryFixture = (overrides: Partial<DocsPageEntry> = {}): DocsPageEntry => {
  const loaded = Promise.resolve({
    toc: tocFixture(),
  });

  return {
    body: ({ components }: { components?: typeof mdxComponents }): ReactElement => {
      const Anchor = components?.a ?? 'span';

      return (
        <p>
          Every rule has <Anchor href='/docs/core/placement'>one home</Anchor>.
        </p>
      );
    },
    description: 'The rules a repository is built by.',
    load: () => loaded,
    title: 'Overview',
    ...overrides,
  };
};

const releaseOf = (providers: DocsProviders): Version | undefined =>
  'release' in providers ? providers.release : Version.create('0.70.0');

const docsWrapperOf = (
  providers: DocsProviders,
): ((props: { children: ReactNode }) => ReactElement) => {
  const { frame, pathname = '/docs' } = providers;
  const release = releaseOf(providers);
  const neverAnswering = createFakeGetVersions().getVersions;
  const findingNothing = createSearchPages(createFakePageSearch([]));

  return ({ children }: { children: ReactNode }): ReactElement => (
    <FrameworkProvider
      useParams={noParams}
      usePathname={(): string => pathname}
      useRouter={staticRouter}
    >
      <SearchPagesContext
        value={'searchPages' in providers ? providers.searchPages : findingNothing}
      >
        <RootProvider
          search={{
            // biome-ignore lint/plugin/compound-parts-share-the-root-context: Fumadocs' root provider names the search dialog's slot SearchDialog
            SearchDialog: DocsSearchWidget,
          }}
          theme={{
            enabled: false,
          }}
        >
          <GetVersionsContext
            value={'getVersions' in providers ? providers.getVersions : neverAnswering}
          >
            <DocsBuiltVersionContext value={release}>
              <IsScreenNarrowContext
                value={frame === undefined ? undefined : createIsScreenNarrow(frame)}
              >
                <MarkSidebarContext
                  value={frame === undefined ? undefined : createMarkSidebar(frame)}
                >
                  {children}
                </MarkSidebarContext>
              </IsScreenNarrowContext>
            </DocsBuiltVersionContext>
          </GetVersionsContext>
        </RootProvider>
      </SearchPagesContext>
    </FrameworkProvider>
  );
};

/**
 * Rendered whole, a body that suspends included; the release is 0.70.0 unless the providers name
 * one, or `undefined` for none; likewise the read of the releases never answers and the search
 * finds nothing
 */
const renderInDocs = (ui: ReactElement, providers: DocsProviders = {}): Promise<RenderResult> =>
  act(() =>
    Promise.resolve(
      render(ui, {
        wrapper: docsWrapperOf(providers),
      }),
    ),
  );

interface HydrationTrees {
  readonly client: ReactElement;
  readonly server: ReactElement;
}

interface HydratedInDocs {
  /** the errors React recovered from by rendering the client's tree over the server's */
  readonly recovered: unknown[];
}

/**
 * hydrates the client's tree over the HTML the server renders of its own, as a prerendered page
 * loads; the release is as in `renderInDocs`
 */
const hydrateInDocs = async (
  { client, server }: HydrationTrees,
  providers: DocsProviders = {},
): Promise<HydratedInDocs> => {
  const Wrapper = docsWrapperOf(providers);
  const container = document.createElement('div');
  const recovered: unknown[] = [];

  // biome-ignore lint/plugin/raw-html-never-reaches-the-dom: the server's own rendering, which hydration takes as markup
  container.innerHTML = renderToString(<Wrapper>{server}</Wrapper>);
  document.body.append(container);

  // awaited, as a tree that suspends while it hydrates asks
  await act(() =>
    Promise.resolve(
      render(client, {
        container,
        hydrate: true,
        onRecoverableError: (error) => {
          recovered.push(error);
        },
        wrapper: Wrapper,
      }),
    ),
  );

  return {
    recovered,
  };
};

export {
  docsWrapperOf,
  hydrateInDocs,
  pageEntryFixture,
  pageTreeFixture,
  renderInDocs,
  settledLoad,
  tocFixture,
  versionsFixture,
};
