// The specs, which never ship: development files, which a part's rule over them leaves out.
export const developmentFiles = [
  '(^|/)(__tests__|e2e)/',
  '^tests/',
];

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
        pathNot: developmentFiles,
      },
      to: {
        path: developmentFiles,
      },
    },
  ],
};
