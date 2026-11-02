import type { ThemeMode } from '../../domain/theme-mode/entities';

/** a platform configuration module's default export; it leaves the tokens to the generation */
type ConfigOfMode = (mode: ThemeMode) => object;

export type { ConfigOfMode };
