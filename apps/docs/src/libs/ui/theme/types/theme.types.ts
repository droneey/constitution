import type { ThemeMode } from '../constants';

/** the colours by their paths under `color.` */
interface ContrastPair {
  readonly background: string;
  readonly foreground: string;
  readonly minimum: number;
}

interface CodeContrast {
  readonly backgrounds: readonly string[];
  readonly minimum: number;
  readonly themes: Readonly<Record<ThemeMode, string>>;
}

interface ThemeSettings {
  readonly code: CodeContrast;
  readonly contrast: readonly ContrastPair[];
  readonly grid: readonly number[];
  /** Tailwind's radius names, each on a radius primitive by its pixels */
  readonly tailwindRadius: Readonly<Record<string, number>>;
}

export type { CodeContrast, ContrastPair, ThemeSettings };
