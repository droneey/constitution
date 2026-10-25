import * as architectureReact from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/_react.mjs';
import * as architectureBun from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/bun.mjs';
import * as architectureCore from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/core.mjs';
import * as architectureUi from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/ui.mjs';
import * as architectureWorkspace from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/workspace.mjs';
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
  // the project's own settings, joined after the parts
  {
    // the Style Dictionary configuration design-tokens builds, a tool the package never exports
    developmentFiles: [
      '^src/libs/style-dictionary/',
    ],
    forbidden: [
      {
        name: 'icon-pack-only-in-the-icons',
        severity: 'error',
        from: {
          pathNot: '^src/integrations/react-dom/icons/',
        },
        to: {
          path: 'node_modules/lucide-react/',
        },
      },
      {
        name: 'base-ui-only-in-the-popover',
        severity: 'error',
        from: {
          pathNot: '^src/integrations/react-dom/components/popover/',
        },
        to: {
          path: 'node_modules/@base-ui/react/',
        },
      },
    ],
    options: {
      doNotFollow: {
        path: [
          'node_modules',
          '^\\.\\./',
        ],
      },
    },
  },
);
