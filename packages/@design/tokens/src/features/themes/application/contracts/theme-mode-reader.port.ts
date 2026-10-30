import type { ThemeModeFiles } from '../../domain/theme-mode/entities';

interface ThemeModeReader {
  /** @throws {UnknownDefaultModeError} when the modifier's default names no context */
  readonly read: () => readonly ThemeModeFiles[];
}

export type { ThemeModeReader };
