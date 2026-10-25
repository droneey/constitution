import type { Config } from 'style-dictionary/types';

import type { ThemeMode } from '#/libs/style-dictionary';
import { configOf } from '#/libs/style-dictionary';

const BUILD_PATH = 'src/libs/ui/theme/constants/';

/** the configuration of each mode, which the runner of `@droneey/design-tokens` builds over its tokens */
export default (mode: ThemeMode): Config => configOf(mode, BUILD_PATH);
