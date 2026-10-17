export default {
  extends: [
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/self.mjs',
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/bun.mjs',
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/core.mjs',
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/typescript.mjs',
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
