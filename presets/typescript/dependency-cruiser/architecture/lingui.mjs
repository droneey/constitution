const MESSAGES = [
  'node_modules/@lingui/',
  '/locales/',
];

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
        path: MESSAGES,
      },
    },
    {
      name: 'primitives-hold-no-text',
      severity: 'error',
      from: {
        path: '^src/libs/ui/',
      },
      to: {
        path: MESSAGES,
      },
    },
  ],
};
