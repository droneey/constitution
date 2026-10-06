// biome-ignore lint/style/noDefaultExport: knip reads a configuration's default export
export default {
  // knip takes a test runner named `bun-specs` for a package of that name; the archive's runner is none.
  ignoreDependencies: [
    '@stryker-mutator/bun-specs-runner',
  ],
};
