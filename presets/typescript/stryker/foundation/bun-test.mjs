// biome-ignore lint/style/noDefaultExport: Stryker reads a configuration's default export
export default {
  testRunner: 'command',
  coverageAnalysis: 'off',
  commandRunner: {
    command: 'bun --config=./bunfig.mutation.toml test --bail',
  },
};
