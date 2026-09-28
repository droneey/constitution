import { config } from '@droneey/devkit-ts-stryker';

import base from './.constitution/presets/stryker/base.mjs';

export default {
  ...config,
  ...base,
  ignorePatterns: [
    ...config.ignorePatterns,
    ...base.ignorePatterns,
  ],
};
