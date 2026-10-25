import { join } from '../../.droneey/constitution/presets/typescript/join.mjs';
import architectureCore from '../../.droneey/constitution/presets/typescript/knip/architecture/core.mjs';
import core from '../../.droneey/constitution/presets/typescript/knip/foundation/core.mjs';
import rumdl from '../../.droneey/constitution/presets/typescript/knip/foundation/rumdl.mjs';
import shellcheck from '../../.droneey/constitution/presets/typescript/knip/foundation/shellcheck.mjs';
import shfmt from '../../.droneey/constitution/presets/typescript/knip/foundation/shfmt.mjs';
import stryker from '../../.droneey/constitution/presets/typescript/knip/foundation/stryker.mjs';
import tombi from '../../.droneey/constitution/presets/typescript/knip/foundation/tombi.mjs';
import yamllint from '../../.droneey/constitution/presets/typescript/knip/foundation/yamllint.mjs';

// knip has no extends, so the parts are joined.
export default join(
  core,
  rumdl,
  shellcheck,
  shfmt,
  stryker,
  tombi,
  yamllint,
  architectureCore,
  // the project's own settings, joined after the parts
  {
    // the build of the program is a development tool, which production mode leaves out
    entry: [
      '!src/entrypoints/cli-build/main.ts!',
    ],
    project: [
      '!src/entrypoints/cli-build/**!',
    ],
    ignoreBinaries: [
      // the hook's specs make a named pipe with it
      'mkfifo',
      // the doctor asks lefthook whether the hooks are installed
      'lefthook',
      // the end-to-end specs find the repository's pinned tools through it
      'mise',
    ],
    // The end-to-end specs run these from node_modules/.bin.
    ignoreDependencies: [
      '@biomejs/biome',
      '@stryker-mutator/core',
      '@swc/core',
      'dclint',
      'syncpack',
    ],
  },
);
