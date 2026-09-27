// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'yaml-only-at-the-edge',
      severity: 'error',
      from: {
        pathNot: [
          '/adapters/',
          '^src/libs/yaml/',
          '(^|/)__tests__/',
        ],
      },
      to: {
        path: 'node_modules/yaml/',
      },
    },
  ],
};
