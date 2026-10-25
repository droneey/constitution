import type { ReactElement } from 'react';

import { createTheme } from '#/libs/ui';

import { ThemeContext } from './theme-provider.context';
import type { ThemeProviderProps } from './theme-provider.types';

function ThemeProvider({ accent, children, output }: ThemeProviderProps): ReactElement {
  const theme = createTheme({
    accent,
    colourLevel: output.colourLevel,
    isMotionReduced: output.isMotionReduced,
    mode: output.themeMode,
  });

  return <ThemeContext value={theme}>{children}</ThemeContext>;
}

export { ThemeProvider };
