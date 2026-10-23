import type { ReactElement } from 'react';

import { accentStylesheetOf } from '#/libs/ui';

import type { ThemeProviderProps } from './theme-provider.types';

/** the identity React hoists the accent's stylesheet by, once however many providers render it */
// Stryker disable next-line StringLiteral: the identity only lets React write the stylesheet once; any name draws the same
const ACCENT_STYLESHEET = 'droneey-accent';

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
