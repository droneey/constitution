// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'packages-blind-to-each-other',
      severity: 'error',
      from: {
        path: '^packages/([^/]+)/([^/]+)/([^/]+)/',
        pathNot: '^packages/[^/]+/common/',
      },
      to: {
        path: '^packages/',
        pathNot: [
          '^packages/$1/$2/$3/',
          '^packages/$1/common/',
        ],
      },
    },
    {
      name: 'common-imports-nothing',
      severity: 'error',
      from: {
        path: '^packages/[^/]+/common/',
        pathNot: '/__tests__/',
      },
      to: {},
    },
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
