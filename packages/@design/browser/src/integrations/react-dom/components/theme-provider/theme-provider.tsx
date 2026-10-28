import type { ReactElement, ReactNode } from 'react';

import type { AccentScale } from '#/libs/ui';
import { accentStylesheetOf } from '#/libs/ui';

import { ACCENT_STYLESHEET } from './theme-provider.constants';

interface ThemeProviderProps {
  /** none keeps the default theme's */
  readonly accent?: AccentScale;
  readonly children: ReactNode;
}

/** the accent applies to the whole document */
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
