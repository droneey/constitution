import type { ThemeModeFiles } from '../../domain/entities';

interface ThemeModeReader {
  /** @throws {UnknownDefaultModeError} when the modifier's default names no context */
  readonly read: () => readonly ThemeModeFiles[];
}

export type { ThemeModeReader };
