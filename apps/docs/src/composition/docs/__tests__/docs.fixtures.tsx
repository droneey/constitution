import type { ReactElement, ReactNode } from 'react';

import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import { FrameworkProvider } from 'fumadocs-core/framework';
import { RootProvider } from 'fumadocs-ui/provider/base';

import { createFakeGetVersions } from '#/__tests__/get-versions.fake';
import type { GetVersions, Versions } from '#/features/versions';
import { GetVersionsContext, Version } from '#/features/versions';
import type { mdxComponents, PageTreeRoot, TocHeading } from '#/libs/ui';

import type { DocsFrame } from '../app/providers';
import { DocsBuiltVersionContext, DocsFrameContext } from '../app/providers';
import type { DocsPageEntry } from '../ui/screens/docs-page';
import { DocsSearchWidget } from '../ui/widgets/docs-search-widget';

interface DocsProviders {
  frame?: DocsFrame;
  getVersions?: GetVersions;
  pathname?: string;
  release?: Version | undefined;
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
    loaded: (): undefined => undefined,
    title: 'Overview',
    ...overrides,
  };
};

const releaseOf = (providers: DocsProviders): Version | undefined =>
  'release' in providers ? providers.release : Version.create('0.70.0');

/** the release is 0.70.0 unless the providers name one, or `undefined` for none */
const renderInDocs = (ui: ReactElement, providers: DocsProviders = {}): RenderResult => {
  const {
    frame,
    getVersions = createFakeGetVersions().getVersions,
    pathname = '/docs',
  } = providers;
  const release = releaseOf(providers);

  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }): ReactElement => (
      <FrameworkProvider
        useParams={noParams}
        usePathname={(): string => pathname}
        useRouter={staticRouter}
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
          <GetVersionsContext value={getVersions}>
            <DocsBuiltVersionContext value={release}>
              <DocsFrameContext value={frame}>{children}</DocsFrameContext>
            </DocsBuiltVersionContext>
          </GetVersionsContext>
        </RootProvider>
      </FrameworkProvider>
    ),
  });
};

export { pageEntryFixture, pageTreeFixture, renderInDocs, tocFixture, versionsFixture };
