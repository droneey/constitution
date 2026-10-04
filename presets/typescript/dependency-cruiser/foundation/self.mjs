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
    {
      name: 'no-duplicate-dep-types',
      severity: 'error',
      from: {},
      to: {
        moreThanOneDependencyType: true,
        dependencyTypesNot: [
          'type-only',
          'npm-peer',
        ],
      },
    },
    {
      name: 'no-deprecated-core',
      severity: 'error',
      from: {},
      to: {
        dependencyTypes: [
          'core',
        ],
        path: '^(?:punycode|domain|constants|sys|_linklist|_stream_wrap)$',
      },
    },
  ],
  options: {
    // dependency-cruiser deprecates swc, but its tsc parser needs the JS API
    // that TypeScript 7.0 lacks.
    // TODO(#186): move to tsc once TypeScript 7.1 ships.
    parser: 'swc',
    skipAnalysisNotInRules: true,
    // A package that names its entry points only in `exports` resolves only when the resolver reads it.
    enhancedResolveOptions: {
      exportsFields: [
        'exports',
      ],
      conditionNames: [
        'import',
        'require',
        'node',
        'default',
      ],
    },
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
