import { ThemeMode } from '../../constants';
import type {
  CodeTheme,
  ContrastCheck,
  DesignTokenGroup,
  DesignTokens,
  ThemeSettings,
} from '../../types';
import { collectTokens } from '../tokens.utils';

/** a small token source with a token of every group the theme writes, white and black its colours */
const createTokenGroup = (overrides: DesignTokenGroup = {}): DesignTokenGroup => ({
  $description: 'A small source.',
  dimension: {
    $type: 'dimension',
    '8': {
      $value: {
        unit: 'px',
        value: 8,
      },
    },
    '16': {
      $value: {
        unit: 'px',
        value: 16,
      },
    },
  },
  spacing: {
    sm: {
      $value: '{dimension.8}',
    },
  },
  size: {
    control: {
      md: {
        $value: '{dimension.16}',
      },
    },
  },
  text: {
    sm: {
      $value: '{dimension.16}',
    },
  },
  leading: {
    sm: {
      $value: '{dimension.8}',
    },
  },
  radius: {
    '4': {
      $value: {
        unit: 'px',
        value: 4,
      },
    },
  },
  duration: {
    fast: {
      $value: {
        unit: 'ms',
        value: 100,
      },
    },
  },
  ease: {
    out: {
      $value: [
        0.23,
        1,
        0.32,
        1,
      ],
    },
  },
  color: {
    $type: 'color',
    neutral: {
      '0': {
        $value: {
          colorSpace: 'oklch',
          components: [
            1,
            0,
            0,
          ],
        },
      },
      '1000': {
        $value: {
          colorSpace: 'oklch',
          components: [
            0,
            0,
            0,
          ],
        },
      },
    },
    surface: {
      base: {
        $value: '{color.neutral.0}',
        $extensions: {
          mode: {
            dark: '{color.neutral.1000}',
          },
        },
      },
    },
    text: {
      primary: {
        $value: '{color.neutral.1000}',
        $extensions: {
          mode: {
            dark: '{color.neutral.0}',
          },
        },
      },
    },
    fill: {
      hover: {
        $value: '{color.neutral.1000}',
        $extensions: {
          mode: {
            dark: '{color.neutral.0}',
          },
          'dev.droneey.share': 0.5,
        },
      },
    },
  },
  font: {
    weight: {
      normal: {
        $value: 400,
        $extensions: {
          mode: {
            dark: 370,
          },
        },
      },
    },
  },
  stroke: {
    icon: {
      $value: 2,
      $extensions: {
        mode: {
          dark: 1.5,
        },
      },
    },
  },
  ...overrides,
});

const createTokens = (overrides: DesignTokenGroup = {}): DesignTokens =>
  collectTokens(createTokenGroup(overrides));

const createThemeSettings = (overrides: Partial<ThemeSettings> = {}): ThemeSettings => ({
  grid: [
    8,
    16,
  ],
  contrast: [
    {
      foreground: 'text.primary',
      background: 'surface.base',
      minimum: 7,
    },
  ],
  code: {
    themes: {
      [ThemeMode.Light]: 'light-code',
      [ThemeMode.Dark]: 'dark-code',
    },
    backgrounds: [
      'surface.base',
    ],
    minimum: 4.5,
  },
  tailwindRadius: {
    sm: 4,
  },
  ...overrides,
});

/** a code theme whose only colour is its editor's, black */
const createCodeTheme = (overrides: Partial<CodeTheme> = {}): CodeTheme => ({
  colors: {
    'editor.foreground': '#000000',
  },
  tokenColors: [],
  ...overrides,
});

const createContrastCheck = (overrides: Partial<ContrastCheck> = {}): ContrastCheck => ({
  mode: ThemeMode.Light,
  label: 'text.primary on surface.base',
  subject: 'text.primary on surface.base',
  ratio: 7.5,
  minimum: 7,
  ...overrides,
});

/** the lines of a stylesheet's block, between the line that opens it and the brace that closes it */
const blockOf = (lines: readonly string[], opening: string): readonly string[] => {
  const start = lines.indexOf(opening) + 1;

  return lines.slice(start, lines.indexOf('}', start));
};

/** the lines of a stylesheet that declare a property */
const declarationsOf = (lines: readonly string[], property: string): readonly string[] =>
  lines.filter((line) => line.trimStart().startsWith(`${property}:`));

export {
  blockOf,
  createCodeTheme,
  createContrastCheck,
  createThemeSettings,
  createTokens,
  declarationsOf,
};
