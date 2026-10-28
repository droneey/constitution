import { Ansis } from 'ansis';

import type { ThemeMode } from '../constants';
import {
  ACCENT_TONE_ROLE,
  DESIGN_TOKENS,
  FRAME_DURATION_TOKEN,
  GLYPHS,
  PIXELS_PER_CELL,
  SPINNER_FRAMES,
  Space,
  TONE_ROLES,
  Tone,
} from '../constants';
import type { TerminalTokens, Theme, ThemeInput } from '../types';

const createTheme = (
  { accent, colourLevel, isMotionReduced, mode }: ThemeInput,
  tokensByMode: Readonly<Record<ThemeMode, TerminalTokens>> = DESIGN_TOKENS,
): Theme => {
  const ansis = new Ansis(colourLevel);
  const modeTokens = tokensByMode[mode];
  const accentStep = modeTokens.accent[ACCENT_TONE_ROLE];

  const hexOf = (tone: Tone): string =>
    tone === Tone.Accent
      ? (accent?.[accentStep] ?? modeTokens.brand[accentStep])
      : modeTokens.colour[TONE_ROLES[tone]];

  const toneHexes: Readonly<Record<Tone, string>> = {
    [Tone.Accent]: hexOf(Tone.Accent),
    [Tone.Success]: hexOf(Tone.Success),
    [Tone.Error]: hexOf(Tone.Error),
    [Tone.Warning]: hexOf(Tone.Warning),
    [Tone.Info]: hexOf(Tone.Info),
    [Tone.Muted]: hexOf(Tone.Muted),
  };

  const cellsOf = (space: Space): number =>
    Math.round(modeTokens.spacingsPx[space] / PIXELS_PER_CELL);

  return {
    glyphs: GLYPHS,
    isMotionReduced,
    paint: (tone: Tone, text: string): string => ansis.hex(toneHexes[tone])(text),
    space: {
      [Space.Xs]: cellsOf(Space.Xs),
      [Space.Sm]: cellsOf(Space.Sm),
      [Space.Md]: cellsOf(Space.Md),
    },
    spinner: {
      frames: SPINNER_FRAMES,
      intervalMs: modeTokens.durationsMs[FRAME_DURATION_TOKEN],
    },
    strong: (text: string): string => ansis.bold(text),
  };
};

export { createTheme };
