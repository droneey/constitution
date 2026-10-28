import type { ConfigOfMode } from '@droneey/design-tokens';

import { configOf } from './scripts/style-dictionary';

const BUILD_PATH = 'src/libs/ui/theme/';

/** the configuration of each mode, which the runner of `@droneey/design-tokens` builds over its tokens */
export default ((mode) => configOf(mode, BUILD_PATH)) satisfies ConfigOfMode;
