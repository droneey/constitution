import type { Config } from 'style-dictionary/types';

import type { ThemeMode } from '#/libs/resolver';

/** what a platform's configuration module exports: its Style Dictionary configuration for one mode, the tokens left to the runner */
type ConfigOfMode = (mode: ThemeMode) => Config;

export type { ConfigOfMode };
