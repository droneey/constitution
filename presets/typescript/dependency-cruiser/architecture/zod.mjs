// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // dependency-cruiser takes the severity of the first part in extends with allowed rules, warn by default.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'zod-imported-by-forms',
      from: {
        path: '/ui/',
      },
      to: {
        path: 'node_modules/zod/',
      },
    },
    {
      comment: 'zod-imported-by-the-document',
      from: {
        path: '^src/composition/',
      },
      to: {
        path: 'node_modules/zod/',
      },
    },
  ],
};
