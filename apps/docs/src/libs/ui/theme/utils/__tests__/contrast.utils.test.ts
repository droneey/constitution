import { describe, expect, it } from 'bun:test';

import { ThemeMode } from '../../constants';
import { checkThemeContrast, formatContrastReport, listContrastFailures } from '../contrast.utils';
import {
  createCodeTheme,
  createContrastCheck,
  createThemeSettings,
  createTokens,
} from './theme.fixtures';

/** past the rounding of the colour maths */
const RATIO_PLACES = 3;

describe('checkThemeContrast', () => {
  it('should check each pair and then the code, mode by mode, laying a shared colour over the base surface', () => {
    // Arrange
    const input = {
      tokens: createTokens(),
      settings: createThemeSettings({
        contrast: [
          {
            foreground: 'text.primary',
            background: 'surface.base',
            minimum: 7,
          },
          {
            foreground: 'text.primary',
            background: 'fill.hover',
            minimum: 7,
          },
        ],
      }),
      codeThemes: {
        [ThemeMode.Light]: createCodeTheme(),
        [ThemeMode.Dark]: createCodeTheme({
          colors: {
            'editor.foreground': '#ffffff',
          },
        }),
      },
    };

    // Act
    const checks = checkThemeContrast(input);

    // Assert
    expect(checks).toStrictEqual([
      {
        mode: ThemeMode.Light,
        label: 'text.primary on surface.base',
        subject: 'text.primary on surface.base',
        ratio: expect.closeTo(21, RATIO_PLACES),
        minimum: 7,
      },
      {
        mode: ThemeMode.Light,
        label: 'text.primary on fill.hover',
        subject: 'text.primary on fill.hover',
        ratio: expect.closeTo(11, RATIO_PLACES),
        minimum: 7,
      },
      {
        mode: ThemeMode.Light,
        label: 'code (light-code) on surface.base',
        subject: 'code on surface.base',
        ratio: expect.closeTo(21, RATIO_PLACES),
        minimum: 4.5,
      },
      {
        mode: ThemeMode.Dark,
        label: 'text.primary on surface.base',
        subject: 'text.primary on surface.base',
        ratio: expect.closeTo(21, RATIO_PLACES),
        minimum: 7,
      },
      {
        mode: ThemeMode.Dark,
        label: 'text.primary on fill.hover',
        subject: 'text.primary on fill.hover',
        ratio: expect.closeTo(1.909, RATIO_PLACES),
        minimum: 7,
      },
      {
        mode: ThemeMode.Dark,
        label: 'code (dark-code) on surface.base',
        subject: 'code on surface.base',
        ratio: expect.closeTo(21, RATIO_PLACES),
        minimum: 4.5,
      },
    ]);
  });

  it.each([
    {
      name: 'a rule of a code scope colours it lighter than the editor',
      tokenColors: [
        {
          scope: 'comment',
          settings: {
            foreground: '#777777',
          },
        },
      ],
      expected: 4.478,
    },
    {
      name: 'the code scope is a later selector of the rule',
      tokenColors: [
        {
          scope: 'source.js string',
          settings: {
            foreground: '#777777',
          },
        },
      ],
      expected: 4.478,
    },
    {
      name: 'the code scope is a later one of a list',
      tokenColors: [
        {
          scope: [
            'markup.heading',
            'keyword.control',
          ],
          settings: {
            foreground: '#555555',
          },
        },
      ],
      expected: 7.455,
    },
    {
      name: 'a scope only ends in a code scope',
      tokenColors: [
        {
          scope: 'punctuation.definition.string',
          settings: {
            foreground: '#777777',
          },
        },
      ],
      expected: 21,
    },
    {
      name: 'a scope only starts with a code scope',
      tokenColors: [
        {
          scope: 'variables',
          settings: {
            foreground: '#777777',
          },
        },
      ],
      expected: 21,
    },
    {
      name: 'a rule names no scope',
      tokenColors: [
        {
          settings: {
            foreground: '#777777',
          },
        },
      ],
      expected: 21,
    },
    {
      name: 'a rule of a code scope gives no colour',
      tokenColors: [
        {
          scope: 'keyword',
          settings: {},
        },
      ],
      expected: 21,
    },
  ])('should take the lowest contrast of code text when $name', ({ tokenColors, expected }) => {
    // Arrange
    const input = {
      tokens: createTokens(),
      settings: createThemeSettings({
        contrast: [],
      }),
      codeThemes: {
        [ThemeMode.Light]: createCodeTheme({
          tokenColors,
        }),
        [ThemeMode.Dark]: createCodeTheme({
          colors: {
            'editor.foreground': '#ffffff',
          },
        }),
      },
    };

    // Act
    const [light] = checkThemeContrast(input);

    // Assert
    expect(light).toStrictEqual(
      createContrastCheck({
        label: 'code (light-code) on surface.base',
        subject: 'code on surface.base',
        ratio: expect.closeTo(expected, RATIO_PLACES),
        minimum: 4.5,
      }),
    );
  });

  it.each([
    {
      name: 'its red and blue fall below zero',
      components: [
        0.6,
        0.3,
        150,
      ],
      expected: 3.123,
    },
    {
      name: 'its blue rises above one',
      components: [
        0.7,
        0.2,
        260,
      ],
      expected: 2.856,
    },
  ])(
    'should clip each channel of a colour beyond the sRGB gamut when $name',
    ({ components, expected }) => {
      // Arrange
      const input = {
        tokens: createTokens({
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
            vivid: {
              $value: {
                colorSpace: 'oklch',
                components,
              },
            },
            surface: {
              base: {
                $value: '{color.neutral.0}',
              },
            },
            text: {
              primary: {
                $value: '{color.vivid}',
              },
            },
          },
        }),
        settings: createThemeSettings(),
        codeThemes: {
          [ThemeMode.Light]: createCodeTheme(),
          [ThemeMode.Dark]: createCodeTheme(),
        },
      };

      // Act
      const [light] = checkThemeContrast(input);

      // Assert
      expect(light).toStrictEqual(
        createContrastCheck({
          ratio: expect.closeTo(expected, RATIO_PLACES),
        }),
      );
    },
  );

  it('should take the rules alone when the code theme has no editor colours', () => {
    // Arrange
    const input = {
      tokens: createTokens(),
      settings: createThemeSettings({
        contrast: [],
      }),
      codeThemes: {
        [ThemeMode.Light]: {
          tokenColors: [
            {
              scope: 'string',
              settings: {
                foreground: '#404040',
              },
            },
          ],
        },
        [ThemeMode.Dark]: createCodeTheme(),
      },
    };

    // Act
    const [light] = checkThemeContrast(input);

    // Assert
    expect(light).toStrictEqual(
      createContrastCheck({
        label: 'code (light-code) on surface.base',
        subject: 'code on surface.base',
        ratio: expect.closeTo(10.368, RATIO_PLACES),
        minimum: 4.5,
      }),
    );
  });
});

describe('formatContrastReport', () => {
  it.each([
    {
      name: 'the mode is the longest',
      check: createContrastCheck({
        ratio: 17.954,
      }),
      expected: 'light text.primary on surface.base: 17.95 (needs 7)',
    },
    {
      name: 'the mode is shorter than the longest',
      check: createContrastCheck({
        mode: ThemeMode.Dark,
        label: 'code (catppuccin-mocha) on fill.danger',
        ratio: 4.5,
        minimum: 4.5,
      }),
      expected: 'dark  code (catppuccin-mocha) on fill.danger: 4.50 (needs 4.5)',
    },
  ])('should return "$expected" when $name', ({ check, expected }) => {
    // Arrange
    const reached = check;

    // Act
    const line = formatContrastReport(reached);

    // Assert
    expect(line).toBe(expected);
  });
});

describe('listContrastFailures', () => {
  it('should refuse only the checks below their minimum, by the subject', () => {
    // Arrange
    const checks = [
      createContrastCheck({
        mode: ThemeMode.Dark,
        label: 'code (dark-code) on fill.danger',
        subject: 'code on fill.danger',
        ratio: 4.256,
        minimum: 4.5,
      }),
      createContrastCheck({
        ratio: 7,
      }),
      createContrastCheck({
        ratio: 7.01,
      }),
    ];

    // Act
    const failures = listContrastFailures(checks);

    // Assert
    expect(failures).toStrictEqual([
      'dark: code on fill.danger is 4.26, needs 4.5',
    ]);
  });
});
