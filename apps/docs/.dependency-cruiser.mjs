export default {
  extends: [
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/self.mjs',
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/core.mjs',
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/typescript.mjs',
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/core.mjs',
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/ui.mjs',
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/_react.mjs',
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/tanstack-router.mjs',
    '../../.droneey/constitution/presets/typescript/dependency-cruiser/architecture/zod.mjs',
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
