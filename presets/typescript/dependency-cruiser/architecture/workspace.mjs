// A unit is a folder of apps/ or packages/; a unit's own shared/ data stays inside it.
// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'units-imported-by-name',
      severity: 'error',
      from: {
        path: '^((?:apps|packages)/[^/]+)/',
      },
      to: {
        path: '^(?:apps|packages)/',
        pathNot: '^$1/',
        dependencyTypes: [
          'local',
        ],
        dependencyTypesNot: [
          'aliased-workspace',
        ],
      },
    },
    {
      name: 'root-imports-units-by-name',
      severity: 'error',
      from: {
        pathNot: '^(?:apps|packages)/',
      },
      to: {
        path: '^(?:apps|packages)/',
        dependencyTypes: [
          'local',
        ],
        dependencyTypesNot: [
          'aliased-workspace',
        ],
      },
    },
    {
      name: 'apps-blind-to-each-other',
      severity: 'error',
      from: {
        path: '^apps/([^/]+)/',
      },
      to: {
        path: '^apps/',
        pathNot: '^apps/$1/',
      },
    },
    {
      name: 'packages-know-no-app',
      severity: 'error',
      from: {
        path: '^packages/',
      },
      to: {
        path: '^apps/',
      },
    },
  ],
};
