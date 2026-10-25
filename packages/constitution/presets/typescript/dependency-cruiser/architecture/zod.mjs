// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // allowedSeverity is warn unless set.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'zod-home-is-the-edge-and-shared-parsing',
      from: {
        path: [
          '^src/(features|composition)/[^/]+/app/',
          '^src/shared/',
        ],
      },
      to: {
        path: 'node_modules/zod/',
      },
    },
    {
      comment: 'zod-imported-by-forms',
      from: {
        path: '/ui/',
      },
      to: {
        path: 'node_modules/zod/',
      },
    },
  ],
};
