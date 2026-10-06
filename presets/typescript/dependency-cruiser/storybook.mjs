// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'stories-unreachable-from-production',
      severity: 'error',
      from: {
        pathNot: [
          '\\.stories\\.[^/]+$',
          '^\\.storybook/',
        ],
      },
      to: {
        path: '\\.stories\\.[^/]+$',
      },
    },
    // typescript.mjs's rule, restated: a story never ships, so it renders with
    // the development dependencies Storybook brings. It comes before typescript.mjs.
    {
      name: 'no-development-dependency-in-production',
      severity: 'error',
      from: {
        path: '^src/',
        pathNot: [
          '(^|/)(__tests__|e2e)/|^tests/',
          '\\.stories\\.[^/]+$',
        ],
      },
      to: {
        dependencyTypes: [
          'npm-dev',
        ],
        dependencyTypesNot: [
          'type-only',
          'npm-peer',
        ],
        pathNot: 'node_modules/@types/',
      },
    },
  ],
};
