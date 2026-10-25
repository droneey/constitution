import { join } from '../../.droneey/constitution/presets/typescript/join.mjs';
import architectureCore from '../../.droneey/constitution/presets/typescript/knip/architecture/core.mjs';
import core from '../../.droneey/constitution/presets/typescript/knip/foundation/core.mjs';
import rumdl from '../../.droneey/constitution/presets/typescript/knip/foundation/rumdl.mjs';
import stryker from '../../.droneey/constitution/presets/typescript/knip/foundation/stryker.mjs';
import yamllint from '../../.droneey/constitution/presets/typescript/knip/foundation/yamllint.mjs';

// knip has no extends, so the parts are joined.
export default join(
  core,
  rumdl,
  stryker,
  yamllint,
  architectureCore,
  // the project's own settings, joined after the parts
  {
    ignoreDependencies: [
      // the mutation check runs Stryker from node_modules
      '@stryker-mutator/core',
    ],
  },
);
