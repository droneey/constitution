// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'zod-only-at-the-edge',
      severity: 'error',
      from: {
        pathNot: [
          '/adapters/',
          '/models/',
          '^src/cli/',
          '^src/root/',
          '^src/composition/',
          '(^|/)__tests__/',
        ],
      },
      to: {
        path: 'node_modules/zod/',
      },
    },
  ],
};
