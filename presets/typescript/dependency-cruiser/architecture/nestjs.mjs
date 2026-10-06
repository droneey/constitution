// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // dependency-cruiser takes the severity of the first part in extends with allowed rules, warn by default.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'nestjs-imported-by-modules-and-providers',
      from: {
        path: [
          '^src/features/[^/]+/app/',
          '^src/composition/',
          '/providers/',
        ],
      },
      to: {
        path: 'node_modules/@nestjs/',
      },
    },
  ],
};
