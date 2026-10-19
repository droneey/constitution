import bunTest from '../../../../.droneey/constitution/presets/typescript/stryker/foundation/bun-test.mjs';
import core from '../../../../.droneey/constitution/presets/typescript/stryker/foundation/core.mjs';
import git from '../../../../.droneey/constitution/presets/typescript/stryker/foundation/git.mjs';
import mise from '../../../../.droneey/constitution/presets/typescript/stryker/foundation/mise.mjs';
import self from '../../../../.droneey/constitution/presets/typescript/stryker/foundation/self.mjs';
import uv from '../../../../.droneey/constitution/presets/typescript/stryker/foundation/uv.mjs';

export default {
  ...self,
  ...git,
  ...mise,
  ...bunTest,
  ...core,
  ignorePatterns: [
    ...git.ignorePatterns,
    ...mise.ignorePatterns,
    ...uv.ignorePatterns,
  ],
  plugins: [
    './src/runner.ts',
    './src/ignorers.ts',
  ],
};
