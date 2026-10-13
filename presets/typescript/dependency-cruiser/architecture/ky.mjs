// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // dependency-cruiser takes the severity of the first part in extends with allowed rules, warn by default.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'ky-home-is-the-edge-and-its-failure-mapper',
      from: {
        path: '^src/shared/',
      },
      to: {
        path: 'node_modules/ky/',
      },
    },
  ],
};
