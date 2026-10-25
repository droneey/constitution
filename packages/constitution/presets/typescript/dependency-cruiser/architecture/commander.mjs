// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // allowedSeverity is warn unless set.
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
