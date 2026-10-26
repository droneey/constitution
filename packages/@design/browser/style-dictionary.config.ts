import type { Config } from 'style-dictionary/types';

import type { ThemeMode } from './scripts/style-dictionary';
import { configOf } from './scripts/style-dictionary';

const BUILD_PATH = 'src/libs/ui/theme/';

/** the configuration of each mode, which the runner of `@droneey/design-tokens` builds over its tokens */
export default (mode: ThemeMode): Config => configOf(mode, BUILD_PATH);
