import { join } from '../../.droneey/constitution/presets/typescript/join.mjs';
import architectureCore from '../../.droneey/constitution/presets/typescript/knip/architecture/core.mjs';
import core from '../../.droneey/constitution/presets/typescript/knip/foundation/core.mjs';
import rumdl from '../../.droneey/constitution/presets/typescript/knip/foundation/rumdl.mjs';
import stryker from '../../.droneey/constitution/presets/typescript/knip/foundation/stryker.mjs';
import tombi from '../../.droneey/constitution/presets/typescript/knip/foundation/tombi.mjs';
import yamllint from '../../.droneey/constitution/presets/typescript/knip/foundation/yamllint.mjs';

// knip has no extends, so the parts are joined.
export default join(
  core,
  rumdl,
  stryker,
  tombi,
  yamllint,
  architectureCore,
  // the project's own settings, joined after the parts
  {
    // the Style Dictionary configuration design-tokens builds is a development tool, which
    // production mode leaves out
    entry: [
      'style-dictionary.config.ts',
    ],
    project: [
      '!src/libs/style-dictionary/**!',
    ],
    ignoreDependencies: [
      // the mutation check runs Stryker from node_modules
      '@stryker-mutator/core',
      // knip's strict mode counts no optional peer as a dependency of production
      'react',
      'react-dom',
      'tailwindcss',
    ],
  },
);
