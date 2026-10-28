import { DESIGN_TOKENS, ThemeMode } from '../../constants';
import type { TerminalTokens } from '../../types';

const defaultBrand = DESIGN_TOKENS[ThemeMode.Light].brand;

const createTokens = (
  overrides: Partial<TerminalTokens> = {},
): Readonly<Record<ThemeMode, TerminalTokens>> => {
  const tokens: TerminalTokens = {
    accent: {
      'accent.text': '600',
    },
    brand: {
      ...defaultBrand,
      '300': '#00ff00',
      '600': '#0000ff',
    },
    colour: {
      'text.danger': '#ff0000',
      'text.info': '#ff0000',
      'text.muted': '#ff0000',
      'text.success': '#ff0000',
      'text.warning': '#ff0000',
    },
    durationsMs: {
      fast: 50,
    },
    spacingsPx: {
      xs: 8,
      sm: 16,
      md: 24,
    },
    ...overrides,
  };

  return {
    [ThemeMode.Light]: tokens,
    [ThemeMode.Dark]: tokens,
  };
};

export { createTokens, defaultBrand };
