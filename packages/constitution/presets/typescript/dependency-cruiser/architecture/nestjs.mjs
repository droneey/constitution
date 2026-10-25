// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // allowedSeverity is warn unless set.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'nestjs-imported-by-modules-and-providers',
      from: {
        path: [
          '^src/(features|composition)/[^/]+/app/',
          '/providers/',
        ],
      },
      to: {
        path: 'node_modules/@nestjs/',
      },
    },
  ],
};
