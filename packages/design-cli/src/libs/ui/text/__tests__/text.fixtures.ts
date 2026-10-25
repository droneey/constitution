import type { Theme } from '../../theme';
import { ColourLevel, createTheme, ThemeMode } from '../../theme';

const createPlainTheme = (): Theme =>
  createTheme({
    colourLevel: ColourLevel.None,
    isMotionReduced: true,
    mode: ThemeMode.Dark,
  });

export { createPlainTheme };
