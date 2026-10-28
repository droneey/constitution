import { describe, expect, it } from 'bun:test';

import { createPlainTheme, GOLD } from '#/__tests__/theme.fixtures';

import { ColourLevel, Space, ThemeMode, Tone } from '../../constants';
import type { Theme } from '../../types';
import { AccentScale } from '../../value-objects';
import { createTokens, defaultBrand } from './tokens.fixtures';

describe('createTheme', () => {
  it.each([
    {
      condition: 'a tone',
      draw: (theme: Theme): string => theme.paint(Tone.Success, 'built'),
      drawn: 'built',
    },
    {
      condition: 'bold text',
      draw: (theme: Theme): string => theme.strong('Checks'),
      drawn: 'Checks',
    },
  ])('should draw $condition as it is when the run shows no colour', ({ draw, drawn }) => {
    // Arrange
    const theme = createPlainTheme();

    // Act
    const text = draw(theme);

    // Assert
    expect(text).toBe(drawn);
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
    const theme = createPlainTheme({
      accent: AccentScale.create(GOLD),
      colourLevel: ColourLevel.TrueColour,
      mode,
    });

    // Act
    const painted = theme.paint(Tone.Accent, 'go');

    // Assert
    expect(painted).toBe(drawn);
  });

  it("should keep the default's step where the app's scale gives that step no sRGB colour", () => {
    // Arrange
    const theme = createPlainTheme(
      {
        accent: AccentScale.create(GOLD),
        colourLevel: ColourLevel.TrueColour,
      },
      createTokens({
        accent: {
          'accent.text': '700',
        },
        brand: {
          ...defaultBrand,
          '700': '#123456',
        },
      }),
    );

    // Act
    const painted = theme.paint(Tone.Accent, 'go');

    // Assert
    expect(painted).toBe('\u001B[38;2;18;52;86mgo\u001B[39m');
  });

  it("should draw the accent on the step the build's accent role reads", () => {
    // Arrange
    const theme = createPlainTheme(
      {
        colourLevel: ColourLevel.TrueColour,
      },
      createTokens(),
    );

    // Act
    const painted = theme.paint(Tone.Accent, 'go');

    // Assert
    expect(painted).toBe('\u001B[38;2;0;0;255mgo\u001B[39m');
  });

  it('should draw every other tone in its role of the build', () => {
    // Arrange
    const theme = createPlainTheme(
      {
        colourLevel: ColourLevel.TrueColour,
      },
      createTokens(),
    );

    // Act
    const painted = theme.paint(Tone.Error, 'no');

    // Assert
    expect(painted).toBe('\u001B[38;2;255;0;0mno\u001B[39m');
  });

  it("should move the spinner at the build's pace", () => {
    // Arrange
    const tokens = createTokens();

    // Act
    const theme = createPlainTheme({}, tokens);

    // Assert
    expect(theme.spinner.intervalMs).toBe(50);
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

  it('should give the spaces in cells', () => {
    // Act
    const theme = createPlainTheme();

    // Assert
    expect(theme.space).toStrictEqual({
      [Space.Xs]: 1,
      [Space.Sm]: 2,
      [Space.Md]: 3,
    });
  });

  it('should move when the run allows motion', () => {
    // Act
    const theme = createPlainTheme({
      isMotionReduced: false,
    });

    // Assert
    expect(theme.isMotionReduced).toBe(false);
  });
});
