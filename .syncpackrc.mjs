import bun from './.droneey/constitution/presets/typescript/syncpack/foundation/bun.mjs';
import core from './.droneey/constitution/presets/typescript/syncpack/foundation/core.mjs';
import self from './.droneey/constitution/presets/typescript/syncpack/foundation/self.mjs';
import typescript from './.droneey/constitution/presets/typescript/syncpack/foundation/typescript.mjs';

// syncpack has no extends: the parts are joined, every list after the lists before it and
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

export default join(self, core, typescript, bun);
