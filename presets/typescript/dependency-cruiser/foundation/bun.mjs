// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  options: {
    builtInModules: {
      add: [
        'bun',
        'bun:test',
      ],
    },
  },
};
