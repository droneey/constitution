import { join } from '../../../../.droneey/constitution/presets/typescript/join.mjs';
import architectureCore from '../../../../.droneey/constitution/presets/typescript/knip/architecture/core.mjs';
import core from '../../../../.droneey/constitution/presets/typescript/knip/foundation/core.mjs';
import stryker from '../../../../.droneey/constitution/presets/typescript/knip/foundation/stryker.mjs';
import yamllint from '../../../../.droneey/constitution/presets/typescript/knip/foundation/yamllint.mjs';

// knip has no extends, so the parts are joined.
export default join(
  core,
  stryker,
  yamllint,
  architectureCore,
  // the project's own settings, joined after the parts
  {
    ignoreBinaries: [
      // the mutation check runs Stryker from node_modules
      'stryker',
    ],
    // Stryker loads the runner and the ignorers by their paths
    entry: [
      'src/integrations/stryker/runner.ts!',
      'src/integrations/stryker/ignorers.ts!',
    ],
  },
);
