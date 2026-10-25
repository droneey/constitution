// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // dependency-cruiser takes the severity of the first part in extends with allowed rules, warn by default.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'ink-imported-by-the-ui',
      from: {
        path: '/ui/',
      },
      to: {
        path: 'node_modules/ink/',
      },
    },
  ],
};
