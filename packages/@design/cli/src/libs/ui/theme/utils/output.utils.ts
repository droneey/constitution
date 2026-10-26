import { ColourLevel, OutputMode, ThemeMode } from '../constants';
import type { Output, OutputInput } from '../types';

// Any non-empty FORCE_COLOR forces colour, as force-color.org and CPython read it; the levels
// Node.js names by 2 and 3 choose a deeper palette.
const deeperLevels: ReadonlyMap<string, ColourLevel> = new Map([
  [
    '2',
    ColourLevel.Ansi256,
  ],
  [
    '3',
    ColourLevel.TrueColour,
  ],
]);

/** `COLORFGBG`'s white and bright white */
const LIGHT_BACKGROUNDS: readonly string[] = [
  '7',
  '15',
] as const;

const isSet = (variable: string | undefined): boolean => variable !== undefined && variable !== '';

const forcedLevelOf = (variable: string | undefined): ColourLevel | undefined => {
  if (variable === undefined || variable === '') {
    return;
  }

  return deeperLevels.get(variable) ?? ColourLevel.Basic;
};

const terminalLevelOf = (env: OutputInput['env']): ColourLevel => {
  if (env['COLORTERM'] === 'truecolor' || env['COLORTERM'] === '24bit') {
    return ColourLevel.TrueColour;
  }

  return env['TERM']?.includes('256') === true ? ColourLevel.Ansi256 : ColourLevel.Basic;
};

const colourLevelOf = (
  input: OutputInput & {
    isPlain: boolean;
  },
): ColourLevel => {
  const { env, flags } = input;
  const forced = forcedLevelOf(env['FORCE_COLOR']);

  if (flags.colour === false) {
    return ColourLevel.None;
  }

  if (flags.colour === true) {
    return Math.max(forced ?? ColourLevel.None, terminalLevelOf(env));
  }

  if (isSet(env['NO_COLOR'])) {
    return ColourLevel.None;
  }

  if (forced !== undefined) {
    return forced;
  }

  return input.isPlain ? ColourLevel.None : terminalLevelOf(env);
};

const chooseOutput = (input: OutputInput): Output => {
  const { env, flags } = input;
  const isPlain =
    flags.plain === true || !input.isTerminal || env['TERM'] === 'dumb' || isSet(env['CI']);
  const colourLevel = colourLevelOf({
    ...input,
    isPlain,
  });
  const background = env['COLORFGBG']?.split(';').at(-1);

  return {
    colourLevel,
    isMotionReduced: isPlain || colourLevel === ColourLevel.None || flags.motion === false,
    mode: isPlain ? OutputMode.Plain : OutputMode.Pretty,
    themeMode: LIGHT_BACKGROUNDS.some((light) => light === background)
      ? ThemeMode.Light
      : ThemeMode.Dark,
  };
};

export { chooseOutput };
