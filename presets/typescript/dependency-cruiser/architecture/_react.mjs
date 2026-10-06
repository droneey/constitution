// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // dependency-cruiser takes the severity of the first part in extends with allowed rules, warn by default.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'react-imported-by-the-ui-and-binding-units',
      from: {
        path: [
          '/ui/',
          '^src/features/[^/]+/app/',
          '^src/composition/',
        ],
      },
      to: {
        path: 'node_modules/react/',
      },
    },
  ],
};
