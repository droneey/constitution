export default {
  extends: [
    './.constitution/presets/typescript/dependency-cruiser/foundation/self.mjs',
    './.constitution/presets/typescript/dependency-cruiser/foundation/bun.mjs',
    './.constitution/presets/typescript/dependency-cruiser/foundation/core.mjs',
    './.constitution/presets/typescript/dependency-cruiser/foundation/typescript.mjs',
    './.constitution/presets/typescript/dependency-cruiser/architecture/yaml.mjs',
    './.constitution/presets/typescript/dependency-cruiser/architecture/core.mjs',
  ],
  options: {
    tsConfig: {
      fileName: 'tsconfig.json',
    },
  },
};
