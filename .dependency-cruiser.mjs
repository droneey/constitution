export default {
  extends: [
    '@droneey/devkit-ts-dependency-cruiser/configs/hygiene.mjs',
    './.constitution/presets/dependency-cruiser/base.mjs',
    './.constitution/presets/dependency-cruiser/yaml.mjs',
    './.constitution/presets/dependency-cruiser/zod.mjs',
  ],
  options: {
    tsConfig: {
      fileName: 'tsconfig.json',
    },
  },
};
