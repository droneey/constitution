import { describe, expect, it } from 'bun:test';

import { ThemeMode } from '../../constants';
import { ThemeTokenError } from '../../errors';
import type { DesignTokenGroup } from '../../types';
import { emitTerminalModule } from '../terminal-module.utils';
import { createModeTokens } from './tokens.fixtures';

const SCALES: DesignTokenGroup = {
  brand: {
    '600': {
      $value: {
        colorSpace: 'oklch',
        components: [
          0.55,
          0.21,
          318,
        ],
        hex: '#a239be',
      },
    },
    '300': {
      $value: {
        colorSpace: 'oklch',
        components: [
          0.8,
          0.13,
          318,
        ],
        hex: '#e1a2f4',
      },
    },
  },
  neutral: {
    '0': {
      $value: {
        colorSpace: 'oklch',
        components: [
          1,
          0,
          0,
        ],
        hex: '#ffffff',
      },
    },
  },
  overlay: {
    'neutral-1000-50': {
      $value: {
        alpha: 0.5,
        colorSpace: 'oklch',
        components: [
          0,
          0,
          0,
        ],
      },
    },
  },
};

describe('emitTerminalModule', () => {
  it("should write the accent's roles as steps by mode, the other roles in hex, the scale, the pace and the spaces", () => {
    // Arrange
    const roles = (step: string): DesignTokenGroup => ({
      color: {
        ...SCALES,
        accent: {
          text: {
            $value: `{color.brand.${step}}`,
          },
        },
        text: {
          primary: {
            $value: '{color.neutral.0}',
          },
        },
        fill: {
          hover: {
            $value: '{color.overlay.neutral-1000-50}',
          },
        },
      },
    });
    const modes = createModeTokens({
      [ThemeMode.Light]: roles('600'),
      [ThemeMode.Dark]: roles('300'),
    });

    // Act
    const lines = emitTerminalModule(modes);

    // Assert
    expect(lines.join('\n')).toBe(`
const designTokens = {
  "accent": {
    "light": {
      "accent.text": "600"
    },
    "dark": {
      "accent.text": "300"
    }
  },
  "brand": {
    "300": "#e1a2f4",
    "600": "#a239be"
  },
  "colour": {
    "light": {
      "text.primary": "#ffffff"
    },
    "dark": {
      "text.primary": "#ffffff"
    }
  },
  "duration": {
    "fast": 100
  },
  "spacing": {
    "sm": 8
  }
};

export { designTokens };
`);
  });

  it('should refuse a role whose colour has no hex', () => {
    // Arrange
    const modes = createModeTokens({
      [ThemeMode.Light]: {
        color: {
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
          },
          text: {
            primary: {
              $value: '{color.neutral.0}',
            },
          },
        },
      },
    });

    // Act
    const act = (): string[] => emitTerminalModule(modes);

    // Assert
    expect(act).toThrow(new ThemeTokenError('color.neutral.0 holds a colour with no hex'));
  });

  it.each([
    {
      name: 'a role names no token',
      overrides: {
        color: {
          text: {
            primary: {
              $value: '{color.neutral.99}',
            },
          },
        },
      },
      refusal: 'no token color.neutral.99',
    },
    {
      name: 'a role names a token that holds no colour',
      overrides: {
        color: {
          text: {
            primary: {
              $value: '{dimension.8}',
            },
          },
        },
      },
      refusal: 'dimension.8 holds no colour',
    },
    {
      name: 'a role names a token that holds a number',
      overrides: {
        color: {
          text: {
            primary: {
              $value: '{font.weight.normal}',
            },
          },
        },
      },
      refusal: 'font.weight.normal holds no colour',
    },
    {
      name: 'a spacing holds text that names no token',
      overrides: {
        spacing: {
          sm: {
            $value: 'small',
          },
        },
      },
      refusal: 'spacing.sm holds no dimension or duration',
    },
    {
      name: 'a duration holds no measure',
      overrides: {
        duration: {
          fast: {
            $value: 100,
          },
        },
      },
      refusal: 'duration.fast holds no dimension or duration',
    },
    {
      name: 'a spacing names a colour',
      overrides: {
        spacing: {
          sm: {
            $value: '{color.neutral.0}',
          },
        },
      },
      refusal: 'color.neutral.0 holds no dimension or duration',
    },
  ])('should refuse the tokens when $name', ({ overrides, refusal }) => {
    // Arrange
    const modes = createModeTokens({
      [ThemeMode.Light]: overrides,
    });

    // Act
    const act = (): string[] => emitTerminalModule(modes);

    // Assert
    expect(act).toThrow(new ThemeTokenError(refusal));
  });
});
