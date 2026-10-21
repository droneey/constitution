import * as architectureWorkspace from './.droneey/constitution/presets/typescript/dependency-cruiser/architecture/workspace.mjs';
import * as self from './.droneey/constitution/presets/typescript/dependency-cruiser/foundation/self.mjs';
import * as workspace from './.droneey/constitution/presets/typescript/dependency-cruiser/foundation/workspace.mjs';
import { join } from './.droneey/constitution/presets/typescript/join.mjs';

// dependency-cruiser's extends keeps the first of two rules of one name, so the parts are joined.
export default join(self, workspace, architectureWorkspace);
