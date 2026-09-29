// biome-ignore lint/style/noDefaultExport: Stryker reads a configuration's default export
export default {
  commandRunner: {
    command: 'bun --config=./bunfig.mutation.toml test --bail',
  },
};
