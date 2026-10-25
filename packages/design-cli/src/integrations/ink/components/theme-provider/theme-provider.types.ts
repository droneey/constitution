import type { ReactNode } from 'react';

import type { AccentTokens, Output } from '#/libs/ui';

interface ThemeProviderProps {
  /** the app's accent; the default theme's where none is given */
  readonly accent?: AccentTokens | undefined;
  readonly children: ReactNode;
  readonly output: Output;
}

export type { ThemeProviderProps };
