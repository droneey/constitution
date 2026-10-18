import type { ReactElement, ReactNode } from 'react';

import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import { FrameworkProvider } from 'fumadocs-core/framework';
import { RootProvider } from 'fumadocs-ui/provider/base';

import type { GetVersions, Versions } from '#/features/versions';
import { GetVersionsContext } from '#/features/versions';
import type { PageTreeRoot, TOCItemType } from '#/libs/ui';

import type { DocsFrame } from '../app/providers';
import { DocsFrameContext } from '../app/providers';
import type { mdxComponents } from '../ui/constants';
import type { DocsPageEntry } from '../ui/screens/docs-page';
import { DocsSearchWidget } from '../ui/widgets/docs-search-widget';
import { pendingVersions } from './get-versions.fake';

interface DocsProviders {
  frame?: DocsFrame;
  getVersions?: GetVersions;
  /** the address the framework reports */
  pathname?: string;
}

const noParams = (): Record<string, string> => ({});

const staticRouter = (): {
  push: () => void;
  refresh: () => void;
} => ({
  push: (): void => undefined,
  refresh: (): void => undefined,
});

/** the releases a site knows of: this one, the latest, and an older one */
const versionsFixture = (overrides: Partial<Versions> = {}): Versions => ({
  latest: '0.70.0',
  versions: [
    '0.70.0',
    '0.69.2',
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

/** a page's contents: a section, a rule under it, and a deeper entry */
const tocFixture = (): TOCItemType[] => [
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

/** a page as its collection offers it, its contents already loaded, its link drawn by the components it is given */
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

/** renders a docs piece inside the providers the site's root mounts, fresh for each render */
const renderInDocs = (
  ui: ReactElement,
  { frame, getVersions = pendingVersions, pathname = '/docs' }: DocsProviders = {},
): RenderResult =>
  render(ui, {
    wrapper: ({ children }: { children: ReactNode }): ReactElement => (
      <FrameworkProvider
        useParams={noParams}
        usePathname={(): string => pathname}
        useRouter={staticRouter}
      >
        <RootProvider
          search={{
            // biome-ignore lint/style/useNamingConvention: Fumadocs' root provider names the search dialog's slot SearchDialog
            SearchDialog: DocsSearchWidget,
          }}
          theme={{
            enabled: false,
          }}
        >
          <GetVersionsContext value={getVersions}>
            <DocsFrameContext value={frame}>{children}</DocsFrameContext>
          </GetVersionsContext>
        </RootProvider>
      </FrameworkProvider>
    ),
  });

export { pageEntryFixture, pageTreeFixture, renderInDocs, tocFixture, versionsFixture };
