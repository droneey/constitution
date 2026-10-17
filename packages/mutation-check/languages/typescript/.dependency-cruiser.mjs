export default {
  extends: [
    '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/self.mjs',
    '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/bun.mjs',
    '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/core.mjs',
    '../../../../.droneey/constitution/presets/typescript/dependency-cruiser/typescript.mjs',
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
