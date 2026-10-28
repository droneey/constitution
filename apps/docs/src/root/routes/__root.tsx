import type { ReactElement } from 'react';

import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router';

import brand from '@droneey/constitution-brand' with { type: 'json' };
import { AccentScale, ThemeProvider } from '@droneey/design-browser/react-dom';

import {
  DocsBuiltVersionContext,
  DocsSearchWidget,
  IsScreenNarrowContext,
  MarkSidebarContext,
} from '#/composition/docs';
import { SearchPagesContext } from '#/features/content';
import { GetVersionsContext } from '#/features/versions';
import { RootProvider } from '#/libs/ui';
import { APP_NAME, MAIN_CONTENT_ID } from '#/shared/constants';

import appCss from '../app.css?url';
import { TRANSLATIONS } from '../constants';
import type { RouterContext } from '../wiring';
import { rootProviders } from '../wiring';

const accent = AccentScale.create(brand);

// Why: a modifier, so a key typed for a screen reader or a speech command never switches the theme.
const isThemeHotKey = (event: KeyboardEvent): boolean =>
  event.altKey && event.shiftKey && event.code === 'KeyD';

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
          className='focusable sr-only z-surface-top rounded-lg bg-fd-primary font-label text-fd-primary-foreground text-label-sm focus:not-sr-only focus:fixed focus:top-xs focus:inset-s-xs focus:inline-flex focus:h-control-md focus:items-center focus:px-sm'
          href={`#${MAIN_CONTENT_ID}`}
        >
          Skip to content
        </a>
        <ThemeProvider accent={accent}>
          <SearchPagesContext value={rootProviders.searchPages}>
            <RootProvider
              i18n={{
                translations: TRANSLATIONS,
              }}
              search={{
                // biome-ignore lint/plugin/compound-parts-share-the-root-context: Fumadocs' root provider names the search dialog's slot SearchDialog
                SearchDialog: DocsSearchWidget,
              }}
              theme={{
                hotKey: isThemeHotKey,
              }}
            >
              <GetVersionsContext value={rootProviders.getVersions}>
                <DocsBuiltVersionContext value={rootProviders.builtVersion}>
                  <IsScreenNarrowContext value={rootProviders.isScreenNarrow}>
                    <MarkSidebarContext value={rootProviders.markSidebar}>
                      <Outlet />
                    </MarkSidebarContext>
                  </IsScreenNarrowContext>
                </DocsBuiltVersionContext>
              </GetVersionsContext>
            </RootProvider>
          </SearchPagesContext>
        </ThemeProvider>
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
        title: APP_NAME,
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
