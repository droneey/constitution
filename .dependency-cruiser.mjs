export default {
  extends: [
    '@droneey/devkit-ts-dependency-cruiser/configs/hygiene.mjs',
    './.constitution/presets/dependency-cruiser/base.mjs',
  ],
  options: {
    tsConfig: {
      fileName: 'tsconfig.json',
    },
  },
};
