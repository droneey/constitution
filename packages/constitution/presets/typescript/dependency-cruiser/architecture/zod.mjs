// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // dependency-cruiser takes the severity of the first part in extends with allowed rules, warn by default.
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
