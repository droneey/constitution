import { describe, expect, it } from 'bun:test';

import { ColourLevel, OutputMode, ThemeMode } from '../../constants';
import { chooseOutput } from '../output.utils';

const envOf = (
  ...variables: readonly (readonly [
    string,
    string,
  ])[]
): Readonly<Record<string, string>> => Object.fromEntries(variables);

const TERM = [
  'TERM',
  'xterm',
] as const;

const terminalEnv = envOf(TERM);

describe('chooseOutput', () => {
  it.each([
    {
      name: 'a terminal',
      env: terminalEnv,
      flags: {},
      isTerminal: true,
      mode: OutputMode.Pretty,
      colourLevel: ColourLevel.Basic,
      isMotionReduced: false,
    },
    {
      name: 'a pipe',
      env: terminalEnv,
      flags: {},
      isTerminal: false,
      mode: OutputMode.Plain,
      colourLevel: ColourLevel.None,
      isMotionReduced: true,
    },
    {
      name: 'a dumb terminal',
      env: envOf([
        'TERM',
        'dumb',
      ]),
      flags: {},
      isTerminal: true,
      mode: OutputMode.Plain,
      colourLevel: ColourLevel.None,
      isMotionReduced: true,
    },
    {
      name: 'CI',
      env: envOf(TERM, [
        'CI',
        'true',
      ]),
      flags: {},
      isTerminal: true,
      mode: OutputMode.Plain,
      colourLevel: ColourLevel.None,
      isMotionReduced: true,
    },
    {
      name: 'an empty CI',
      env: envOf(TERM, [
        'CI',
        '',
      ]),
      flags: {},
      isTerminal: true,
      mode: OutputMode.Pretty,
      colourLevel: ColourLevel.Basic,
      isMotionReduced: false,
    },
    {
      name: '--plain',
      env: terminalEnv,
      flags: {
        plain: true,
      },
      isTerminal: true,
      mode: OutputMode.Plain,
      colourLevel: ColourLevel.None,
      isMotionReduced: true,
    },
    {
      name: 'NO_COLOR',
      env: envOf(TERM, [
        'NO_COLOR',
        '1',
      ]),
      flags: {},
      isTerminal: true,
      mode: OutputMode.Pretty,
      colourLevel: ColourLevel.None,
      isMotionReduced: true,
    },
    {
      name: 'an empty NO_COLOR',
      env: envOf(TERM, [
        'NO_COLOR',
        '',
      ]),
      flags: {},
      isTerminal: true,
      mode: OutputMode.Pretty,
      colourLevel: ColourLevel.Basic,
      isMotionReduced: false,
    },
    {
      name: '--color over NO_COLOR',
      env: envOf(TERM, [
        'NO_COLOR',
        '1',
      ]),
      flags: {
        colour: true,
      },
      isTerminal: true,
      mode: OutputMode.Pretty,
      colourLevel: ColourLevel.Basic,
      isMotionReduced: false,
    },
    {
      name: '--color with FORCE_COLOR=3',
      env: envOf(TERM, [
        'FORCE_COLOR',
        '3',
      ]),
      flags: {
        colour: true,
      },
      isTerminal: false,
      mode: OutputMode.Plain,
      colourLevel: ColourLevel.TrueColour,
      isMotionReduced: true,
    },
    {
      name: '--no-color',
      env: envOf(TERM, [
        'FORCE_COLOR',
        '3',
      ]),
      flags: {
        colour: false,
      },
      isTerminal: true,
      mode: OutputMode.Pretty,
      colourLevel: ColourLevel.None,
      isMotionReduced: true,
    },
    {
      name: 'FORCE_COLOR=2 in a pipe',
      env: envOf([
        'FORCE_COLOR',
        '2',
      ]),
      flags: {},
      isTerminal: false,
      mode: OutputMode.Plain,
      colourLevel: ColourLevel.Ansi256,
      isMotionReduced: true,
    },
    {
      name: 'FORCE_COLOR=0',
      env: envOf(TERM, [
        'FORCE_COLOR',
        '0',
      ]),
      flags: {},
      isTerminal: true,
      mode: OutputMode.Pretty,
      colourLevel: ColourLevel.None,
      isMotionReduced: true,
    },
    {
      name: 'an unknown FORCE_COLOR',
      env: envOf(TERM, [
        'FORCE_COLOR',
        'always',
      ]),
      flags: {},
      isTerminal: true,
      mode: OutputMode.Pretty,
      colourLevel: ColourLevel.Basic,
      isMotionReduced: false,
    },
    {
      name: 'a 256-colour terminal',
      env: envOf([
        'TERM',
        'xterm-256color',
      ]),
      flags: {},
      isTerminal: true,
      mode: OutputMode.Pretty,
      colourLevel: ColourLevel.Ansi256,
      isMotionReduced: false,
    },
    {
      name: 'a true-colour terminal',
      env: envOf(TERM, [
        'COLORTERM',
        'truecolor',
      ]),
      flags: {},
      isTerminal: true,
      mode: OutputMode.Pretty,
      colourLevel: ColourLevel.TrueColour,
      isMotionReduced: false,
    },
    {
      name: 'a 24-bit terminal',
      env: envOf(TERM, [
        'COLORTERM',
        '24bit',
      ]),
      flags: {},
      isTerminal: true,
      mode: OutputMode.Pretty,
      colourLevel: ColourLevel.TrueColour,
      isMotionReduced: false,
    },
    {
      name: '--no-motion',
      env: terminalEnv,
      flags: {
        motion: false,
      },
      isTerminal: true,
      mode: OutputMode.Pretty,
      colourLevel: ColourLevel.Basic,
      isMotionReduced: true,
    },
    {
      name: 'no TERM',
      env: envOf(),
      flags: {},
      isTerminal: true,
      mode: OutputMode.Pretty,
      colourLevel: ColourLevel.Basic,
      isMotionReduced: false,
    },
  ])(
    'should choose $mode, colour level $colourLevel, motion reduced $isMotionReduced for $name',
    ({ colourLevel, env, flags, isMotionReduced, isTerminal, mode }) => {
      // Arrange
      const input = {
        env,
        flags,
        isTerminal,
      };

      // Act
      const output = chooseOutput(input);

      // Assert
      expect(output).toStrictEqual({
        colourLevel,
        isMotionReduced,
        mode,
        themeMode: ThemeMode.Dark,
      });
    },
  );

  it.each([
    {
      background: '15;0',
      themeMode: ThemeMode.Dark,
    },
    {
      background: '0;15',
      themeMode: ThemeMode.Light,
    },
    {
      background: '0;default;7',
      themeMode: ThemeMode.Light,
    },
    {
      background: '0;8',
      themeMode: ThemeMode.Dark,
    },
  ])(
    'should choose the $themeMode mode when COLORFGBG is $background',
    ({ background, themeMode }) => {
      // Arrange
      const input = {
        env: envOf(TERM, [
          'COLORFGBG',
          background,
        ]),
        flags: {},
        isTerminal: true,
      };

      // Act
      const output = chooseOutput(input);

      // Assert
      expect(output.themeMode).toBe(themeMode);
    },
  );
});
