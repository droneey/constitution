import * as architectureBun from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/bun.mjs';
import * as architectureCore from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/core.mjs';
import * as architectureWorkspace from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/workspace.mjs';
import * as architectureYamlJs from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/yaml-js.mjs';
import * as architectureZod from '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/zod.mjs';
import * as bun from '../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/bun.mjs';
import * as core from '../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/core.mjs';
import * as self from '../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/self.mjs';
import * as typescript from '../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/typescript.mjs';

// dependency-cruiser's extends keeps the first of two rules of one name, so the parts are joined
// instead: every list after the lists before it and every table merged into the one before it, then
// the rules a part builds over the development files every part names.
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
const modules = [
  self,
  core,
  typescript,
  bun,
  architectureCore,
  architectureWorkspace,
  architectureBun,
  architectureYamlJs,
  architectureZod,
];
const developmentFiles = modules.flatMap((next) => next.developmentFiles ?? []);

export default join(
  ...modules.map((next) => next.default ?? {}),
  {
    forbidden: modules.flatMap((next) => next.forbiddenOver?.(developmentFiles) ?? []),
  },
  // the project's own settings, joined after the parts
  {
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
