export default {
  extends: [
    '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/self.mjs',
    '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/bun.mjs',
    '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/core.mjs',
    '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/foundation/typescript.mjs',
  ],
  allowed: [
    {
      comment: 'a tool the archive carries, laid out flat, imports the packages it runs with',
      from: {
        path: '^src/',
      },
      to: {},
    },
  ],
};
