// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'no-undeclared-dependency',
      severity: 'error',
      from: {},
      to: {
        dependencyTypes: [
          'npm-no-pkg',
          'npm-unknown',
        ],
      },
    },
    {
      name: 'no-unresolvable',
      severity: 'error',
      from: {},
      to: {
        couldNotResolve: true,
      },
    },
    {
      name: 'no-deprecated-dependency',
      severity: 'error',
      from: {},
      to: {
        dependencyTypes: [
          'deprecated',
        ],
      },
    },
  ],
  options: {
    parser: 'swc',
    doNotFollow: {
      path: [
        'node_modules',
      ],
    },
    exclude: {
      path: [
        '(^|/)\\.[^/]+/',
        '(^|/)dist/',
        '\\.gen\\.',
      ],
    },
  },
};
