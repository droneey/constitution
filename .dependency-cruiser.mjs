export default {
  extends: [
    './.droneey/constitution/presets/typescript/dependency-cruiser/self.mjs',
    './.droneey/constitution/presets/typescript/dependency-cruiser/bun.mjs',
    './.droneey/constitution/presets/typescript/dependency-cruiser/core.mjs',
    './.droneey/constitution/presets/typescript/dependency-cruiser/typescript.mjs',
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
