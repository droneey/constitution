import * as architectureReact from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/_react.mjs';
import * as architectureBun from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/bun.mjs';
import * as architectureCommander from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/commander.mjs';
import * as architectureCore from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/core.mjs';
import * as architectureInk from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/ink.mjs';
import * as architectureUi from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/ui.mjs';
import * as architectureWorkspace from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/workspace.mjs';
import * as architectureYamlJs from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/yaml-js.mjs';
import * as architectureZod from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/zod.mjs';
import * as bun from '../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/bun.mjs';
import * as core from '../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/core.mjs';
import * as self from '../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/self.mjs';
import * as typescript from '../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/typescript.mjs';
import * as workspace from '../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/workspace.mjs';
import { join } from '../../.droneey/constitution/presets/typescript/join.mjs';

// dependency-cruiser's extends keeps the first of two rules of one name, so the parts are joined.
export default join(
  self,
  core,
  typescript,
  workspace,
  bun,
  architectureCore,
  architectureUi,
  architectureWorkspace,
  architectureReact,
  architectureBun,
  architectureCommander,
  architectureInk,
  architectureYamlJs,
  architectureZod,
  // the project's own settings, joined after the parts
  {
    // the build of the program is a tool the program never runs
    developmentFiles: [
      '^src/entrypoints/cli-build/',
    ],
    options: {
      // Another unit of the workspace is cruised by its own configuration, not followed into.
      doNotFollow: {
        path: [
          'node_modules',
          '^\\.\\./',
        ],
      },
    },
  },
);
