import { fileURLToPath } from 'node:url';

import architecture from '../../.droneey/constitution/presets/typescript/stryker/architecture/core.mjs';
import architectureTanstackStart from '../../.droneey/constitution/presets/typescript/stryker/architecture/tanstack-start.mjs';
import bunTest from '../../.droneey/constitution/presets/typescript/stryker/bun-test.mjs';
import core from '../../.droneey/constitution/presets/typescript/stryker/core.mjs';
import git from '../../.droneey/constitution/presets/typescript/stryker/git.mjs';
import mise from '../../.droneey/constitution/presets/typescript/stryker/mise.mjs';
import self from '../../.droneey/constitution/presets/typescript/stryker/self.mjs';
import tanstackStart from '../../.droneey/constitution/presets/typescript/stryker/tanstack-start.mjs';

export default {
  ...self,
  ...git,
  ...mise,
  ...bunTest,
  ...core,
  ignorePatterns: [
    ...git.ignorePatterns,
    ...mise.ignorePatterns,
    '.output',
    '.tanstack',
  ],
  plugins: [
    fileURLToPath(import.meta.resolve('@droneey/mutation-check/runner')),
    fileURLToPath(import.meta.resolve('@droneey/mutation-check/ignorers')),
  ],
  mutate: [
    ...core.mutate,
    ...tanstackStart.mutate,
    ...architecture.mutate,
    ...architectureTanstackStart.mutate,
  ],
};
