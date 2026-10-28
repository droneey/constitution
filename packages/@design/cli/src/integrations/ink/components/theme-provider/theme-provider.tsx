import type { ReactElement, ReactNode } from 'react';

import type { AccentScale, Output } from '#/libs/ui';
import { createTheme } from '#/libs/ui';

import { ThemeContext } from '../../theme';

interface ThemeProviderProps {
  /** none keeps the default theme's */
  readonly accent?: AccentScale;
  readonly children: ReactNode;
  readonly output: Output;
}

function ThemeProvider({ children, output, ...accentInput }: ThemeProviderProps): ReactElement {
  const theme = createTheme({
    ...accentInput,
    colourLevel: output.colourLevel,
    isMotionReduced: output.isMotionReduced,
    mode: output.themeMode,
  });

  return <ThemeContext value={theme}>{children}</ThemeContext>;
}

export type { ThemeProviderProps };
export { ThemeProvider };
