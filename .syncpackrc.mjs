import jsRuntime from './.droneey/constitution/presets/json/syncpack/foundation/_js-runtime.mjs';
import bun from './.droneey/constitution/presets/json/syncpack/foundation/bun.mjs';
import core from './.droneey/constitution/presets/json/syncpack/foundation/core.mjs';
import self from './.droneey/constitution/presets/json/syncpack/foundation/self.mjs';
import { join } from './.droneey/constitution/presets/typescript/join.mjs';

// syncpack has no extends, so the parts are joined.
export default join(self, core, jsRuntime, bun);
