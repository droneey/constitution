// biome-ignore lint/style/noDefaultExport: Stryker reads a configuration's default export
export default {
  testRunner: 'bun-specs',
  plugins: [
    './.droneey/constitution/tools/mutation-check/dist/runner.js',
  ],
  coverageAnalysis: 'off',
};
