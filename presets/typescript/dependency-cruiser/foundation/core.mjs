// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-test-code-in-production',
      severity: 'error',
      from: {
        pathNot: '(^|/)(__tests__|e2e)/|^tests/',
      },
      to: {
        path: '(^|/)(__tests__|e2e)/|^tests/',
      },
    },
  ],
};
