import type { ReactElement } from 'react';

import { accentStylesheetOf } from '#/libs/ui';

import { ACCENT_STYLESHEET } from './theme-provider.constants';
import type { ThemeProviderProps } from './theme-provider.types';

/** puts the app's accent in place of the default theme's, for the whole document */
function ThemeProvider({ accent, children }: ThemeProviderProps): ReactElement {
  return (
    <>
      {accent !== undefined && (
        <style
          href={ACCENT_STYLESHEET}
          // biome-ignore lint/suspicious/noUnknownAttribute: React 19 hoists a stylesheet with a precedence into the head
          precedence='default'
        >
          {accentStylesheetOf(accent)}
        </style>
      )}
      {children}
    </>
  );
}

export { ThemeProvider };
