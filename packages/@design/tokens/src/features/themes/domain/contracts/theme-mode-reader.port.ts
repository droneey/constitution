import type { ThemeModeFiles } from '../entities';

interface ThemeModeReader {
  /** every mode of the tokens' `theme` modifier, with the files it takes */
  readonly read: () => readonly ThemeModeFiles[];
}

export type { ThemeModeReader };
