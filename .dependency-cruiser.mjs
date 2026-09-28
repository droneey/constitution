export default {
  extends: [
    '@droneey/devkit-ts-dependency-cruiser/configs/base.mjs',
    './.constitution/presets/dependency-cruiser/yaml.mjs',
    './.constitution/presets/dependency-cruiser/zod.mjs',
    './.constitution/presets/dependency-cruiser/base.mjs',
  ],
  options: {
    tsConfig: {
      fileName: 'tsconfig.json',
    },
  },
};
