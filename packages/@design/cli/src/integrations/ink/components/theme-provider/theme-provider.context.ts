import { createContext } from 'react';

import type { Theme } from '#/libs/ui';
import { ColourLevel, createTheme, ThemeMode } from '#/libs/ui';

const ThemeContext = createContext<Theme>(
  createTheme({
    colourLevel: ColourLevel.None,
    isMotionReduced: true,
    mode: ThemeMode.Dark,
  }),
);

export { ThemeContext };
