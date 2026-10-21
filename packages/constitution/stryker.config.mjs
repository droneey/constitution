import { fileURLToPath } from 'node:url';

import { join } from '../../.droneey/constitution/presets/typescript/join.mjs';
import architectureCore from '../../.droneey/constitution/presets/typescript/stryker/architecture/core.mjs';
import bunTest from '../../.droneey/constitution/presets/typescript/stryker/foundation/bun-test.mjs';
import core from '../../.droneey/constitution/presets/typescript/stryker/foundation/core.mjs';
import git from '../../.droneey/constitution/presets/typescript/stryker/foundation/git.mjs';
import mise from '../../.droneey/constitution/presets/typescript/stryker/foundation/mise.mjs';
import self from '../../.droneey/constitution/presets/typescript/stryker/foundation/self.mjs';
import uv from '../../.droneey/constitution/presets/typescript/stryker/foundation/uv.mjs';

// Stryker has no extends, so the parts are joined.
export default {
  ...join(self, core, bunTest, git, mise, uv, architectureCore),
  // this repository runs the mutation check from its source, not from the archive's build
  plugins: [
    fileURLToPath(import.meta.resolve('@droneey/mutation-check/runner')),
    fileURLToPath(import.meta.resolve('@droneey/mutation-check/ignorers')),
  ],
};
