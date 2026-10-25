import type { ColourLevel, Glyph, OutputMode, Space, ThemeMode, Tone } from '../constants';
import type { AccentTokens } from './accent.types';

/** a mode's default theme, as the design build writes it for a command line */
interface TerminalTokens {
  /** the step of the accent's scale each accent role reads */
  readonly accent: Readonly<Record<string, string>>;
  /** the default accent's scale in hex */
  readonly brand: Readonly<Record<string, string>>;
  /** every other role in hex */
  readonly colour: Readonly<Record<string, string>>;
  readonly duration: Readonly<Record<string, number>>;
  /** in pixels */
  readonly spacing: Readonly<Record<string, number>>;
}

interface Spinner {
  readonly frames: readonly string[];
  readonly intervalMs: number;
}

interface Theme {
  readonly glyphs: Readonly<Record<Glyph, string>>;
  readonly isMotionReduced: boolean;
  readonly paint: (tone: Tone, text: string) => string;
  /** in cells */
  readonly space: Readonly<Record<Space, number>>;
  readonly spinner: Spinner;
  readonly strong: (text: string) => string;
}

interface ThemeInput {
  /** the default accent where none is given */
  readonly accent?: AccentTokens | undefined;
  readonly colourLevel: ColourLevel;
  readonly isMotionReduced: boolean;
  readonly mode: ThemeMode;
}

interface Output {
  readonly colourLevel: ColourLevel;
  readonly isMotionReduced: boolean;
  readonly mode: OutputMode;
  readonly themeMode: ThemeMode;
}

/** `--color` or `--no-color`, `--no-motion`, `--plain`; a flag left out asks nothing */
interface OutputFlags {
  readonly colour?: boolean;
  readonly motion?: boolean;
  readonly plain?: boolean;
}

interface OutputInput {
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly flags: OutputFlags;
  readonly isTerminal: boolean;
}

export type { Output, OutputFlags, OutputInput, Spinner, TerminalTokens, Theme, ThemeInput };
