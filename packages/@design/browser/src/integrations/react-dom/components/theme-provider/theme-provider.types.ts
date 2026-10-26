import type { ReactNode } from 'react';

import type { AccentTokens } from '#/libs/ui';

interface ThemeProviderProps {
  /** the app's accent; the default theme's stays where none is given */
  readonly accent?: AccentTokens;
  readonly children: ReactNode;
}

export type { ThemeProviderProps };
