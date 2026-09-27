// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'application-returns-codes-not-text',
      severity: 'error',
      from: {
        path: '^src/features/[^/]+/(domain|app)/',
      },
      to: {
        path: [
          'node_modules/(@lingui|@inlang)/',
          '^src/paraglide/',
        ],
      },
    },
  ],
};
