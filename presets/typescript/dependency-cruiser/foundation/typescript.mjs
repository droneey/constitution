// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'no-development-dependency-in-production',
      severity: 'error',
      from: {
        path: '^src/',
        pathNot: '(^|/)(__tests__|e2e)/|^tests/',
      },
      to: {
        dependencyTypes: [
          'npm-dev',
        ],
        dependencyTypesNot: [
          'type-only',
        ],
        pathNot: 'node_modules/@types/',
      },
    },
  ],
};
