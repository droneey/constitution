import type { ThemeMode } from '../entities';

/** what a platform's configuration module exports: given one mode, its configuration of the build, the tokens left to the generation */
type ConfigOfMode = (mode: ThemeMode) => object;

export type { ConfigOfMode };
