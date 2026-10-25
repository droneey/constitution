import { join } from '../../../../.droneey/constitution/presets/typescript/join.mjs';
import architectureCore from '../../../../.droneey/constitution/presets/typescript/stryker/architecture/core.mjs';
import bunTest from '../../../../.droneey/constitution/presets/typescript/stryker/foundation/bun-test.mjs';
import core from '../../../../.droneey/constitution/presets/typescript/stryker/foundation/core.mjs';
import git from '../../../../.droneey/constitution/presets/typescript/stryker/foundation/git.mjs';
import self from '../../../../.droneey/constitution/presets/typescript/stryker/foundation/self.mjs';
import workspace from '../../../../.droneey/constitution/presets/typescript/stryker/foundation/workspace.mjs';

// Stryker has no extends, so the parts are joined.
export default {
  ...join(self, core, workspace, bunTest, git, architectureCore),
  // the runner and the ignorers are this package's own source
  plugins: [
    './src/integrations/stryker/runner.ts',
    './src/integrations/stryker/ignorers.ts',
  ],
};
