// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // dependency-cruiser takes the severity of the first part in extends with allowed rules, warn by default.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'commander-imported-by-commands',
      from: {
        path: '^src/(features|composition)/[^/]+/app/.*\\.cli\\.[^/]+$',
      },
      to: {
        path: 'node_modules/commander/',
      },
    },
  ],
};
