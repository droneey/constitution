import type { ThemeModeFiles } from '../../domain/entities';
import type { ConfigOfMode } from './config-of-mode.port';

interface ThemeBuilder {
  /** @throws {ConfigModuleError} when `configOf` throws it for a mode */
  readonly build: (configOf: ConfigOfMode, modes: readonly ThemeModeFiles[]) => Promise<void>;
}

export type { ThemeBuilder };
