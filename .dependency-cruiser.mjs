export default {
  extends: [
    './.constitution/presets/dependency-cruiser/foundation/self.mjs',
    './.constitution/presets/dependency-cruiser/foundation/typescript.mjs',
    './.constitution/presets/dependency-cruiser/architecture/yaml.mjs',
    './.constitution/presets/dependency-cruiser/architecture/core.mjs',
  ],
  options: {
    tsConfig: {
      fileName: 'tsconfig.json',
    },
  },
};
