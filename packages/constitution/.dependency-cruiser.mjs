export default {
  extends: [
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/self.mjs',
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/bun.mjs',
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/core.mjs',
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/typescript.mjs',
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/yaml-js.mjs',
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/core.mjs',
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
};
