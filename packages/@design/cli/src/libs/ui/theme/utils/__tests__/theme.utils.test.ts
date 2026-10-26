import { describe, expect, it } from 'bun:test';

import { ColourLevel, Space, ThemeMode, Tone } from '../../constants';
import { MissingTokenError } from '../../errors';
import { createPlainTheme, createTokens, GOLD } from './theme.fixtures';

describe('createTheme', () => {
  it('should draw the text as it is when the run shows no colour', () => {
    // Arrange
    const theme = createPlainTheme();

    // Act
    const drawn = [
      theme.paint(Tone.Success, 'built'),
      theme.strong('Checks'),
    ];

    // Assert
    expect(drawn).toStrictEqual([
      'built',
      'Checks',
    ]);
  });

  it.each([
    {
      mode: ThemeMode.Light,
      colourLevel: ColourLevel.TrueColour,
      drawn: '\u001B[38;2;0;124;37mbuilt\u001B[39m',
    },
    {
      mode: ThemeMode.Dark,
      colourLevel: ColourLevel.TrueColour,
      drawn: '\u001B[38;2;143;216;158mbuilt\u001B[39m',
    },
    {
      mode: ThemeMode.Dark,
      colourLevel: ColourLevel.Ansi256,
      drawn: '\u001B[38;5;151mbuilt\u001B[39m',
    },
  ])(
    'should draw a tone in its role of the $mode mode at colour level $colourLevel',
    ({ colourLevel, drawn, mode }) => {
      // Arrange
      const theme = createPlainTheme({
        colourLevel,
        mode,
      });

      // Act
      const painted = theme.paint(Tone.Success, 'built');

      // Assert
      expect(painted).toBe(drawn);
    },
  );

  it.each([
    {
      mode: ThemeMode.Light,
      drawn: '\u001B[38;2;131;92;0mgo\u001B[39m',
    },
    {
      mode: ThemeMode.Dark,
      drawn: '\u001B[38;2;229;191;109mgo\u001B[39m',
    },
  ])("should draw the accent on the app's own scale in the $mode mode", ({ drawn, mode }) => {
    // Arrange
    const accent = GOLD;

    // Act
    const theme = createPlainTheme({
      accent,
      colourLevel: ColourLevel.TrueColour,
      mode,
    });

    // Assert
    expect(theme.paint(Tone.Accent, 'go')).toBe(drawn);
  });

  it("should keep the default's step where the app's scale gives that step no sRGB colour", () => {
    // Arrange
    const tokens = createTokens({
      accent: {
        'accent.text': '700',
      },
      brand: {
        '700': '#123456',
      },
    });

    // Act
    const theme = createPlainTheme(
      {
        accent: GOLD,
        colourLevel: ColourLevel.TrueColour,
      },
      tokens,
    );

    // Assert
    expect(theme.paint(Tone.Accent, 'go')).toBe('\u001B[38;2;18;52;86mgo\u001B[39m');
  });

  it('should take the build it is given, its pace and its roles', () => {
    // Arrange
    const tokens = createTokens();

    // Act
    const theme = createPlainTheme(
      {
        colourLevel: ColourLevel.TrueColour,
        mode: ThemeMode.Light,
      },
      tokens,
    );

    // Assert
    expect(theme.paint(Tone.Accent, 'go')).toBe('\u001B[38;2;0;0;255mgo\u001B[39m');
    expect(theme.paint(Tone.Error, 'no')).toBe('\u001B[38;2;255;0;0mno\u001B[39m');
    expect(theme.spinner.intervalMs).toBe(50);
  });

  it.each([
    {
      name: 'a colour for a role',
      tokens: createTokens({
        colour: {},
      }),
      token: 'text.success',
    },
    {
      name: 'a colour for a step',
      tokens: createTokens({
        brand: {},
      }),
      token: 'accent.text',
    },
    {
      name: 'its pace',
      tokens: createTokens({
        duration: {},
      }),
      token: 'fast',
    },
    {
      name: 'a space',
      tokens: createTokens({
        spacing: {},
      }),
      token: 'xs',
    },
  ])('should refuse the build when it holds no $name', ({ token, tokens }) => {
    // Arrange
    const input = {};

    // Act
    const build = (): unknown => createPlainTheme(input, tokens);

    // Assert
    expect(build).toThrow(new MissingTokenError(token));
  });

  it('should set the text apart in bold when the run shows styles', () => {
    // Arrange
    const theme = createPlainTheme({
      colourLevel: ColourLevel.Basic,
    });

    // Act
    const strong = theme.strong('Checks');

    // Assert
    expect(strong).toBe('\u001B[1mChecks\u001B[22m');
  });

  it("should give the spaces in cells and the spinner at the tokens' fast pace", () => {
    // Arrange
    const isMotionReduced = false;

    // Act
    const theme = createPlainTheme({
      isMotionReduced,
    });

    // Assert
    expect(theme.space).toStrictEqual({
      [Space.Xs]: 1,
      [Space.Sm]: 2,
      [Space.Md]: 3,
    });
    expect(theme.spinner.intervalMs).toBe(100);
    expect(theme.spinner.frames).toStrictEqual([
      '⠋',
      '⠙',
      '⠹',
      '⠸',
      '⠼',
      '⠴',
      '⠦',
      '⠧',
      '⠇',
      '⠏',
    ]);
    expect(theme.isMotionReduced).toBe(false);
  });
});
