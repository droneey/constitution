import type { ReactElement } from 'react';

import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router';

import { RootProvider } from 'fumadocs-ui/provider/tanstack';

import { DocsFrameContext, DocsSearchWidget } from '#/composition/docs';
import { documentFrame } from '#/composition/docs/adapters/document';
import { createGetVersions, GetVersionsContext } from '#/features/versions';
import { createStaticFileVersionsRepository } from '#/features/versions/adapters/static-file';
import { appName, mainContentId } from '#/shared/constants';

import appCss from '../app.css?url';
import { translations } from '../constants';
import type { RouterContext } from '../wiring';

const getVersions = createGetVersions(createStaticFileVersionsRepository('/versions.json'));

// a modifier, so a key typed for a screen reader or a speech command never switches the theme
const isThemeHotKey = (e: KeyboardEvent): boolean => e.altKey && e.shiftKey && e.code === 'KeyD';

function RootComponent(): ReactElement {
  return (
    <html
      lang='en'
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body className='flex flex-col min-h-svh'>
        <a
          className='focusable sr-only z-60 rounded-lg bg-fd-primary text-sm font-medium text-fd-primary-foreground focus:not-sr-only focus:fixed focus:top-xs focus:start-xs focus:inline-flex focus:h-control-md focus:items-center focus:px-sm'
          href={`#${mainContentId}`}
        >
          Skip to content
        </a>
        <RootProvider
          i18n={{
            translations,
          }}
          search={{
            // biome-ignore lint/style/useNamingConvention: Fumadocs' root provider names the search dialog's slot SearchDialog
            SearchDialog: DocsSearchWidget,
          }}
          theme={{
            hotKey: isThemeHotKey,
          }}
        >
          <GetVersionsContext value={getVersions}>
            <DocsFrameContext value={documentFrame}>
              <Outlet />
            </DocsFrameContext>
          </GetVersionsContext>
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: appName,
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
});
