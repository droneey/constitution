// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // allowedSeverity is warn unless set.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'react-imported-by-the-ui-and-binding-units',
      from: {
        path: [
          '/ui/',
          '^src/(features|composition)/[^/]+/app/',
        ],
      },
      to: {
        path: 'node_modules/react/',
      },
    },
  ],
};
