import { ColourLevel, ThemeMode } from '../../constants';
import type { AccentTokens, TerminalTokens, Theme, ThemeInput } from '../../types';
import { createTheme } from '../theme.utils';

const createPlainTheme = (
  overrides: Partial<ThemeInput> = {},
  tokens?: Readonly<Record<ThemeMode, TerminalTokens>>,
): Theme =>
  createTheme(
    {
      colourLevel: ColourLevel.None,
      isMotionReduced: true,
      mode: ThemeMode.Dark,
      ...overrides,
    },
    tokens,
  );

/**
 * a generated theme of its own, the same in both modes: the accent's text on its 600, every other role
 * red
 */
const createTokens = (
  overrides: Partial<TerminalTokens> = {},
): Readonly<Record<ThemeMode, TerminalTokens>> => {
  const tokens = {
    accent: {
      'accent.text': '600',
    },
    brand: {
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
    duration: {
      fast: 50,
    },
    spacing: {
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

/** an app's brand.tokens.json: its 300 and 600 with an sRGB fallback, its 700 without */
const GOLD: AccentTokens = {
  color: {
    brand: {
      $type: 'color',
      // a step a brand file leaves empty, as JSON can
      '50': JSON.parse('null'),
      '300': {
        $value: {
          colorSpace: 'oklch',
          components: [
            0.82,
            0.11,
            85,
          ],
          hex: '#e5bf6d',
        },
      },
      '600': {
        $value: {
          colorSpace: 'oklch',
          components: [
            0.5,
            0.17,
            85,
          ],
          hex: '#835c00',
        },
      },
      '700': {
        $value: {
          colorSpace: 'oklch',
          components: [
            0.42,
            0.086,
            85,
          ],
        },
      },
    },
  },
} as const;

export { createPlainTheme, createTokens, GOLD };
