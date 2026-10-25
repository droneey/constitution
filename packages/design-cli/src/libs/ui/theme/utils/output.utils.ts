import { ColourLevel, OutputMode, ThemeMode } from '../constants';
import type { Output, OutputInput } from '../types';

/** as Node.js and the colour libraries read `FORCE_COLOR` */
const FORCED_LEVELS: Readonly<Record<string, ColourLevel>> = {
  '': ColourLevel.Basic,
  '0': ColourLevel.None,
  '1': ColourLevel.Basic,
  '2': ColourLevel.Ansi256,
  '3': ColourLevel.TrueColour,
  false: ColourLevel.None,
  true: ColourLevel.Basic,
} as const;

/** `COLORFGBG`'s white and bright white */
const LIGHT_BACKGROUNDS: readonly string[] = [
  '7',
  '15',
] as const;

const NOT_FORCED = 'unset';

const isSet = (variable: string | undefined): boolean => variable !== undefined && variable !== '';

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
  const forced = FORCED_LEVELS[env['FORCE_COLOR'] ?? NOT_FORCED];

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
