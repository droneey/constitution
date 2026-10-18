import type { ThemeMode } from '../constants';

/** two colours, by their paths under `color.`, and the contrast they must keep */
interface ContrastPair {
  readonly background: string;
  readonly foreground: string;
  readonly minimum: number;
}

/** the code theme of each mode, the backgrounds code sits on, and the contrast its colours keep there */
interface CodeContrast {
  readonly backgrounds: readonly string[];
  readonly minimum: number;
  readonly themes: Readonly<Record<ThemeMode, string>>;
}

/** what the token source asks of itself, beside its tokens */
interface ThemeSettings {
  readonly code: CodeContrast;
  readonly contrast: readonly ContrastPair[];
  readonly grid: readonly number[];
  /** Tailwind's radius names, each on a radius primitive by its pixels */
  readonly tailwindRadius: Readonly<Record<string, number>>;
}

export type { CodeContrast, ContrastPair, ThemeSettings };
