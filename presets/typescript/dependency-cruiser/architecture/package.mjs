// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'package-knows-no-consumer',
      severity: 'error',
      from: {
        path: '^packages/',
      },
      to: {
        pathNot: [
          '^packages/',
          'node_modules/',
        ],
        dependencyTypesNot: [
          'core',
        ],
      },
    },
    {
      name: 'root-takes-packages-by-name',
      severity: 'error',
      from: {
        pathNot: '^packages/',
      },
      to: {
        path: '^packages/',
      },
    },
  ],
  options: {
    preserveSymlinks: true,
  },
};
