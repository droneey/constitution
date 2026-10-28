import type {
  ACCENT_TONE_ROLE,
  ColourLevel,
  ColourRole,
  DESIGN_TOKENS,
  FRAME_DURATION_TOKEN,
  Glyph,
  OutputMode,
  Space,
  ThemeMode,
  Tone,
} from '../constants';
import type { AccentScale } from '../value-objects';

/** a step of the accent's scale, as the tokens' generation writes it */
type AccentStep = keyof (typeof DESIGN_TOKENS)[ThemeMode]['brand'];

/** what the theme reads of a mode's default theme, as the tokens' generation writes it for a command line */
interface TerminalTokens {
  /** the step of the accent's scale the accent's role reads */
  readonly accent: Readonly<Record<typeof ACCENT_TONE_ROLE, AccentStep>>;
  /** the default accent's scale in hex */
  readonly brand: Readonly<Record<AccentStep, string>>;
  /** every other role in hex */
  readonly colour: Readonly<Record<ColourRole, string>>;
  readonly durationsMs: Readonly<Record<typeof FRAME_DURATION_TOKEN, number>>;
  readonly spacingsPx: Readonly<Record<Space, number>>;
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
  readonly accent?: AccentScale;
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
