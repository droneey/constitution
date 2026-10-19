import { describe, expect, it } from 'bun:test';

import { ThemeTokenError } from '../../errors';
import { emitThemeCss } from '../css.utils';
import { blockOf, createTokens, declarationsOf } from './theme.fixtures';

describe('emitThemeCss', () => {
  it('should write the primitives, the semantic tokens and the values of each mode', () => {
    // Arrange
    const tokens = createTokens();

    // Act
    const lines = emitThemeCss(tokens, {
      sm: 4,
      md: 8,
    });

    // Assert
    expect(lines).toStrictEqual([
      '',
      '@layer base {',
      '  :root {',
      '    --p-color-neutral-0: oklch(1 0 0);',
      '    --p-color-neutral-1000: oklch(0 0 0);',
      '    --p-dimension-8: 0.5rem;',
      '    --p-dimension-16: 1rem;',
      '    --p-radius-4: 0.25rem;',
      '  }',
      '}',
      '',
      '@theme {',
      '  --color-surface-base: light-dark(var(--p-color-neutral-0), var(--p-color-neutral-1000));',
      '  --color-text-primary: light-dark(var(--p-color-neutral-1000), var(--p-color-neutral-0));',
      '  --color-fill-hover: light-dark(color-mix(in oklab, var(--p-color-neutral-1000) 50%, transparent), color-mix(in oklab, var(--p-color-neutral-0) 50%, transparent));',
      '  --spacing-sm: var(--p-dimension-8);',
      '  --size-control-md: var(--p-dimension-16);',
      '  --spacing-control-md: var(--size-control-md);',
      '  --text-sm: var(--p-dimension-16);',
      '  --text-sm--line-height: var(--p-dimension-8);',
      '  --radius-sm: var(--p-radius-4);',
      '  --radius-md: var(--p-radius-8);',
      '  --duration-fast: 100ms;',
      '  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);',
      '  --font-weight-normal: 400;',
      '}',
      '',
      ':root {',
      '  --stroke-icon: 2;',
      '}',
      '',
      '.dark {',
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

  it('should keep the value of a token in the dark mode when it names none of its own', () => {
    // Arrange
    const tokens = createTokens({
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
        surface: {
          base: {
            $value: '{color.neutral.0}',
          },
        },
      },
      font: {},
      stroke: {
        icon: {
          $value: 2,
          $extensions: {},
        },
      },
    });

    // Act
    const lines = emitThemeCss(tokens, {});

    // Assert
    expect([
      declarationsOf(lines, '--color-surface-base'),
      blockOf(lines, '.dark {'),
    ]).toStrictEqual([
      [
        '  --color-surface-base: light-dark(var(--p-color-neutral-0), var(--p-color-neutral-0));',
      ],
      [
        '  --stroke-icon: 2;',
      ],
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
      name: 'a primitive colour holds a measure',
      overrides: {
        color: {
          neutral: {
            '0': {
              $value: {
                unit: 'px',
                value: 1,
              },
            },
          },
        },
      },
      refusal: 'color.neutral.0 holds no colour',
    },
    {
      name: 'a semantic colour refers to no token in the dark mode',
      overrides: {
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
          surface: {
            base: {
              $value: '{color.neutral.0}',
              $extensions: {
                mode: {
                  dark: 0,
                },
              },
            },
          },
        },
      },
      refusal: 'color.surface.base refers to no token in the dark mode',
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
                1,
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
      refusal: 'stroke.icon holds no number or text in the light mode',
    },
  ])('should refuse the tokens when $name', ({ overrides, refusal }) => {
    // Arrange
    const tokens = createTokens(overrides);

    // Act
    const act = (): string[] => emitThemeCss(tokens, {});

    // Assert
    expect(act).toThrow(new ThemeTokenError(refusal));
  });
});
