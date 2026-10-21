import * as architectureBun from '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/bun.mjs';
import * as architectureCore from '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/core.mjs';
import * as architectureWorkspace from '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/workspace.mjs';
import * as bun from '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/bun.mjs';
import * as core from '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/core.mjs';
import * as self from '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/self.mjs';
import * as typescript from '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/typescript.mjs';
import * as workspace from '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/workspace.mjs';
import { join } from '../../../../.droneey/constitution/presets/typescript/join.mjs';

// dependency-cruiser's extends keeps the first of two rules of one name, so the parts are joined.
export default join(
  self,
  core,
  typescript,
  workspace,
  bun,
  architectureCore,
  architectureWorkspace,
  architectureBun,
);
