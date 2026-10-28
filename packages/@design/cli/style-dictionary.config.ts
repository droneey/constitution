import type { ConfigOfMode } from '@droneey/design-tokens';

import { configOf } from './scripts/style-dictionary';

const BUILD_PATH = 'src/libs/ui/theme/constants/';

export default ((mode) => configOf(mode, BUILD_PATH)) satisfies ConfigOfMode;
