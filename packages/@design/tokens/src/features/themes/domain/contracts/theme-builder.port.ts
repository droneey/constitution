import type { ThemeModeFiles } from '../entities';
import type { ConfigOfMode } from './config-of-mode.port';

interface ThemeBuilder {
  /** Builds each mode, one after the other, with the configuration `configOf` gives it, and writes its files. */
  readonly build: (configOf: ConfigOfMode, modes: readonly ThemeModeFiles[]) => Promise<void>;
}

export type { ThemeBuilder };
