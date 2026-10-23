import { describe, expect, it } from 'bun:test';

import { TAILWIND_RADIUS, ThemeMode } from '../../constants';
import { ThemeTokenError } from '../../errors';
import { emitTailwindTheme, emitThemeCss } from '../css.utils';
import { createModeTokens } from './tokens.fixtures';

describe('emitThemeCss', () => {
  it("should write the primitives in the base layer, the light mode's roles in the theme layer and the dark mode's under .dark", () => {
    // Arrange
    const modes = createModeTokens();

    // Act
    const lines = emitThemeCss(modes);

    // Assert
    expect(lines).toStrictEqual([
      '',
      '@layer base {',
      '  :root {',
      '    --p-color-neutral-0: oklch(1 0 0);',
      '    --p-color-neutral-1000: oklch(0 0 0);',
      '    --p-color-overlay-neutral-1000-50: oklch(0 0 0 / 0.5);',
      '    --p-dimension-8: 0.5rem;',
      '    --p-dimension-16: 1rem;',
      '    --p-radius-4: 0.25rem;',
      '    --p-ring-2: 0.125rem;',
      '    --p-shadow-drop-sm: 0px 4px 6px -4px oklch(0 0 0 / 0.1), 0px 1px 2px 0px oklch(0 0 0);',
      '    --p-scale-90: 0.9;',
      '    --p-layer-50: 50;',
      '  }',
      '}',
      '',
      '@layer theme {',
      '  :root {',
      '    --color-surface-base: var(--p-color-neutral-0);',
      '    --color-text-primary: var(--p-color-neutral-1000);',
      '    --color-fill-hover: var(--p-color-overlay-neutral-1000-50);',
      '    --spacing-sm: var(--p-dimension-8);',
      '    --size-control-md: var(--p-dimension-16);',
      '    --text-sm: var(--p-dimension-16);',
      '    --leading-sm: var(--p-dimension-8);',
      '    --radius-surface-raised: var(--p-radius-4);',
      '    --ring-focus-width: var(--p-ring-2);',
      '    --shadow-surface-raised: var(--p-shadow-drop-sm);',
      '    --scale-surface-enter: var(--p-scale-90);',
      '    --layer-surface-raised: var(--p-layer-50);',
      '    --duration-fast: 100ms;',
      '    --ease-out: cubic-bezier(0.23, 1, 0.32, 1);',
      '    --font-weight-normal: 400;',
      '  }',
      '}',
      '',
      ':root {',
      '  --stroke-icon: 2;',
      '}',
      '',
      '.dark {',
      '  --color-surface-base: var(--p-color-neutral-1000);',
      '  --color-text-primary: var(--p-color-neutral-0);',
      '  --color-fill-hover: var(--p-color-overlay-neutral-1000-50);',
      '  --font-weight-normal: 370;',
      '  --stroke-icon: 1.5;',
      '}',
      '',
      '@media (prefers-reduced-motion: reduce) {',
      '  :root {',
      '    --duration-fast: 0ms;',
      '  }',
      '}',
      '',
    ]);
  });

  it.each([
    {
      name: 'a primitive colour holds no colour',
      overrides: {
        color: {
          neutral: {
            '0': {
              $value: 1,
            },
          },
        },
      },
      refusal: 'color.neutral.0 holds no colour',
    },
    {
      name: 'a colour holds text that refers to no token',
      overrides: {
        color: {
          surface: {
            base: {
              $value: 'white',
            },
          },
        },
      },
      refusal: 'color.surface.base holds no colour',
    },
    {
      name: 'a spacing holds a measure of its own',
      overrides: {
        spacing: {
          sm: {
            $value: {
              unit: 'px',
              value: 8,
            },
          },
        },
      },
      refusal: 'spacing.sm refers to no token',
    },
    {
      name: 'a role names no token',
      overrides: {
        spacing: {
          sm: {
            $value: '{dimension.99}',
          },
        },
      },
      refusal: 'no token dimension.99',
    },
    {
      name: 'a radius primitive holds no measure',
      overrides: {
        radius: {
          '4': {
            $value: 4,
          },
        },
      },
      refusal: 'radius.4 holds no dimension or duration',
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
      name: 'a duration holds a colour',
      overrides: {
        duration: {
          fast: {
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
      },
      refusal: 'duration.fast holds no dimension or duration',
    },
    {
      name: 'a curve holds no list of numbers',
      overrides: {
        ease: {
          out: {
            $value: 'ease-out',
          },
        },
      },
      refusal: 'ease.out holds no list of numbers',
    },
    {
      name: 'a stroke holds a list',
      overrides: {
        stroke: {
          icon: {
            $value: [
              2,
            ],
          },
        },
      },
      refusal: 'stroke.icon holds no number or text',
    },
    {
      name: 'a curve holds a list that is not all numbers',
      overrides: {
        ease: {
          out: {
            $value: JSON.parse('[0.23, "1"]'),
          },
        },
      },
      refusal: 'ease.out holds no list of numbers',
    },
    {
      name: 'a ring primitive holds no measure',
      overrides: {
        ring: {
          '2': {
            $value: 2,
          },
        },
      },
      refusal: 'ring.2 holds no dimension or duration',
    },
    {
      name: 'a scale primitive holds a measure',
      overrides: {
        scale: {
          '90': {
            $value: {
              unit: 'px',
              value: 90,
            },
          },
        },
      },
      refusal: 'scale.90 holds no number or text',
    },
    {
      name: 'a layer primitive holds a measure',
      overrides: {
        layer: {
          '50': {
            $value: {
              unit: 'px',
              value: 50,
            },
          },
        },
      },
      refusal: 'layer.50 holds no number or text',
    },
    {
      name: 'a shadow holds a number',
      overrides: {
        shadow: {
          drop: {
            sm: {
              $value: 4,
            },
          },
        },
      },
      refusal: 'shadow.drop.sm holds no shadow',
    },
    {
      name: 'a shadow holds a list of numbers',
      overrides: {
        shadow: {
          drop: {
            sm: {
              $value: [
                4,
              ],
            },
          },
        },
      },
      refusal: 'shadow.drop.sm holds no shadow',
    },
  ])('should refuse the tokens when $name', ({ overrides, refusal }) => {
    // Arrange
    const modes = createModeTokens({
      [ThemeMode.Light]: overrides,
    });

    // Act
    const act = (): string[] => emitThemeCss(modes);

    // Assert
    expect(act).toThrow(new ThemeTokenError(refusal));
  });
});

describe('emitTailwindTheme', () => {
  it("should map Tailwind's names onto the roles the root declares, sizes as spacing, leading as line height and layers as z-index", () => {
    // Arrange
    const modes = createModeTokens();

    // Act
    const lines = emitTailwindTheme(modes, {
      sm: 4,
      md: 8,
    });

    // Assert
    expect(lines).toStrictEqual([
      '',
      '@theme inline reference {',
      '  --color-surface-base: var(--color-surface-base);',
      '  --color-text-primary: var(--color-text-primary);',
      '  --color-fill-hover: var(--color-fill-hover);',
      '  --spacing-sm: var(--spacing-sm);',
      '  --size-control-md: var(--size-control-md);',
      '  --text-sm: var(--text-sm);',
      '  --spacing-control-md: var(--size-control-md);',
      '  --text-sm--line-height: var(--leading-sm);',
      '  --radius-sm: var(--p-radius-4);',
      '  --radius-md: var(--p-radius-8);',
      '  --radius-surface-raised: var(--radius-surface-raised);',
      '  --shadow-surface-raised: var(--shadow-surface-raised);',
      '  --scale-surface-enter: var(--scale-surface-enter);',
      '  --z-index-surface-raised: var(--layer-surface-raised);',
      '  --duration-fast: var(--duration-fast);',
      '  --ease-out: var(--ease-out);',
      '  --font-weight-normal: var(--font-weight-normal);',
      '}',
      '',
    ]);
  });

  it("should map Tailwind's radius names to the radius primitives by their pixels", () => {
    // Arrange
    const modes = createModeTokens();

    // Act
    const lines = emitTailwindTheme(modes, TAILWIND_RADIUS);

    // Assert
    expect(
      lines.filter((line) => line.startsWith('  --radius-') && line.includes('--p-')),
    ).toStrictEqual([
      '  --radius-xs: var(--p-radius-4);',
      '  --radius-sm: var(--p-radius-4);',
      '  --radius-md: var(--p-radius-8);',
      '  --radius-lg: var(--p-radius-8);',
      '  --radius-xl: var(--p-radius-12);',
      '  --radius-2xl: var(--p-radius-16);',
      '  --radius-3xl: var(--p-radius-24);',
      '  --radius-4xl: var(--p-radius-32);',
    ]);
  });
});
