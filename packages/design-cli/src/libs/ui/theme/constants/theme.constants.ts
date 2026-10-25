import { tokens as darkTokens } from './dark.gen';
import { tokens as lightTokens } from './light.gen';

/** the contexts of the tokens' `theme` modifier */
enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
}

/** each mode's default theme, as the design build writes it */
const DESIGN_TOKENS = {
  [ThemeMode.Light]: lightTokens,
  [ThemeMode.Dark]: darkTokens,
} as const;

export { DESIGN_TOKENS, ThemeMode };
