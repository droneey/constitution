import type { ReactElement, ReactNode } from 'react';

import type { AccentScale } from '#/libs/ui';
import { accentStylesheetOf } from '#/libs/ui';

import { ACCENT_STYLESHEET } from './theme-provider.constants';

interface ThemeProviderProps {
  /** the app's accent; the default theme's stays where none is given */
  readonly accent?: AccentScale;
  readonly children: ReactNode;
}

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

export type { ThemeProviderProps };
export { ThemeProvider };
