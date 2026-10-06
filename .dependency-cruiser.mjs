export default {
  extends: [
    './.droneey/constitution/presets/typescript/dependency-cruiser/foundation/self.mjs',
    './.droneey/constitution/presets/typescript/dependency-cruiser/foundation/bun.mjs',
    './.droneey/constitution/presets/typescript/dependency-cruiser/foundation/core.mjs',
    './.droneey/constitution/presets/typescript/dependency-cruiser/foundation/typescript.mjs',
    './.droneey/constitution/presets/typescript/dependency-cruiser/architecture/yaml.mjs',
    './.droneey/constitution/presets/typescript/dependency-cruiser/architecture/core.mjs',
  ],
  allowed: [
    {
      comment:
        "the archive's tools are programs of their own, laid out flat, and import the packages they run with",
      from: {
        path: '^tools/[^/]+/src/',
      },
      to: {},
    },
  ],
};
