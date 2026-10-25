import { Ansis } from 'ansis';

import type { ThemeMode, Tone } from '../constants';
import {
  DESIGN_TOKENS,
  FRAME_DURATION,
  GLYPHS,
  PIXELS_PER_CELL,
  SPINNER_FRAMES,
  Space,
  TONE_ROLES,
} from '../constants';
import type { AccentTokens, TerminalTokens, Theme, ThemeInput } from '../types';
import { isRecord } from './guards.utils';

/** a step without an sRGB fallback keeps the default's */
const scaleOf = (accent: AccentTokens): Readonly<Record<string, string>> =>
  Object.fromEntries(
    Object.entries(accent.color.brand).flatMap(([step, token]) => {
      const colour = isRecord(token) ? token['$value'] : undefined;
      const hex = isRecord(colour) ? colour['hex'] : undefined;

      return typeof hex === 'string'
        ? [
            [
              step,
              hex,
            ],
          ]
        : [];
    }),
  );

const amountOf = (measures: Readonly<Record<string, number>>, name: string): number => {
  const amount = measures[name];

  if (amount === undefined) {
    throw new Error(`the design tokens hold no ${name}`);
  }

  return amount;
};

/** @throws {@link Error} when the tokens hold no colour for a tone's role, or no duration or space */
const createTheme = (
  { accent, colourLevel, isMotionReduced, mode }: ThemeInput,
  modes: Readonly<Record<ThemeMode, TerminalTokens>> = DESIGN_TOKENS,
): Theme => {
  const ansis = new Ansis(colourLevel);
  const tokens = modes[mode];
  const scale = {
    ...tokens.brand,
    ...(accent === undefined ? {} : scaleOf(accent)),
  };

  const hexOf = (tone: Tone): string => {
    const role = TONE_ROLES[tone];
    const step = tokens.accent[role];
    const hex = step === undefined ? tokens.colour[role] : scale[step];

    if (hex === undefined) {
      throw new Error(`the design tokens hold no colour for ${role}`);
    }

    return hex;
  };

  const cellsOf = (space: Space): number =>
    Math.round(amountOf(tokens.spacing, space) / PIXELS_PER_CELL);

  return {
    glyphs: GLYPHS,
    isMotionReduced,
    paint: (tone: Tone, text: string): string => ansis.hex(hexOf(tone))(text),
    space: {
      [Space.Xs]: cellsOf(Space.Xs),
      [Space.Sm]: cellsOf(Space.Sm),
      [Space.Md]: cellsOf(Space.Md),
    },
    spinner: {
      frames: SPINNER_FRAMES,
      intervalMs: amountOf(tokens.duration, FRAME_DURATION),
    },
    strong: (text: string): string => ansis.bold(text),
  };
};

export { createTheme };
