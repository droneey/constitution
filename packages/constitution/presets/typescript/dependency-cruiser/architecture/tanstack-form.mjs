// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // allowedSeverity is warn unless set.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'form-library-imported-by-the-ui',
      from: {
        path: [
          '/ui/',
        ],
      },
      to: {
        path: 'node_modules/@tanstack/react-form/',
      },
    },
  ],
};
