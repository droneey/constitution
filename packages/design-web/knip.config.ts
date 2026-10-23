import { join } from '../../.droneey/constitution/presets/typescript/join.mjs';
import architectureCore from '../../.droneey/constitution/presets/typescript/knip/architecture/core.mjs';
import betterleaks from '../../.droneey/constitution/presets/typescript/knip/foundation/betterleaks.mjs';
import core from '../../.droneey/constitution/presets/typescript/knip/foundation/core.mjs';
import mise from '../../.droneey/constitution/presets/typescript/knip/foundation/mise.mjs';
import osvScanner from '../../.droneey/constitution/presets/typescript/knip/foundation/osv-scanner.mjs';
import rumdl from '../../.droneey/constitution/presets/typescript/knip/foundation/rumdl.mjs';
import shellcheck from '../../.droneey/constitution/presets/typescript/knip/foundation/shellcheck.mjs';
import shfmt from '../../.droneey/constitution/presets/typescript/knip/foundation/shfmt.mjs';
import stryker from '../../.droneey/constitution/presets/typescript/knip/foundation/stryker.mjs';
import uv from '../../.droneey/constitution/presets/typescript/knip/foundation/uv.mjs';
import yamllint from '../../.droneey/constitution/presets/typescript/knip/foundation/yamllint.mjs';
import workflowLefthook from '../../.droneey/constitution/presets/typescript/knip/workflow/lefthook.mjs';

// knip has no extends, so the parts are joined.
export default join(
  core,
  betterleaks,
  mise,
  osvScanner,
  rumdl,
  shellcheck,
  shfmt,
  stryker,
  uv,
  yamllint,
  architectureCore,
  workflowLefthook,
  // the project's own settings, joined after the parts
  {
    // the design build is a development tool, which production mode leaves out
    entry: [
      '!src/entrypoints/design-build/main.ts!',
    ],
    project: [
      '!src/entrypoints/design-build/**!',
    ],
    ignoreDependencies: [
      // the mutation check runs Stryker from node_modules
      '@stryker-mutator/core',
      // the design build reaches the tokens by import.meta.resolve, which knip does not read
      '@droneey/design-tokens',
      // knip's strict mode counts no optional peer as a dependency of production
      'react',
      'react-dom',
      'tailwindcss',
    ],
  },
);
