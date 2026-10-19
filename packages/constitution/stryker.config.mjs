import { fileURLToPath } from 'node:url';

import architectureCore from '../../.droneey/constitution/presets/typescript/stryker/architecture/core.mjs';
import bunTest from '../../.droneey/constitution/presets/typescript/stryker/foundation/bun-test.mjs';
import core from '../../.droneey/constitution/presets/typescript/stryker/foundation/core.mjs';
import git from '../../.droneey/constitution/presets/typescript/stryker/foundation/git.mjs';
import mise from '../../.droneey/constitution/presets/typescript/stryker/foundation/mise.mjs';
import self from '../../.droneey/constitution/presets/typescript/stryker/foundation/self.mjs';
import uv from '../../.droneey/constitution/presets/typescript/stryker/foundation/uv.mjs';

// Stryker has no extends: the parts are joined, every list after the lists before it and
// every table merged into the one before it.
const isRecord = (setting) =>
  typeof setting === 'object' && setting !== null && !Array.isArray(setting);
const join = (...parts) => {
  const joined = {};

  for (const next of parts) {
    for (const [key, setting] of Object.entries(next)) {
      const before = joined[key];

      if (Array.isArray(before) && Array.isArray(setting)) {
        joined[key] = [
          ...before,
          ...setting,
        ];
      } else if (isRecord(before) && isRecord(setting)) {
        joined[key] = {
          ...before,
          ...setting,
        };
      } else {
        joined[key] = setting;
      }
    }
  }

  return joined;
};

export default {
  ...join(self, core, bunTest, git, mise, uv, architectureCore),
  // this repository runs the mutation check from its source, not from the archive's build
  plugins: [
    fileURLToPath(import.meta.resolve('@droneey/mutation-check/runner')),
    fileURLToPath(import.meta.resolve('@droneey/mutation-check/ignorers')),
  ],
};
