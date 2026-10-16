// A unit is a folder of apps/, shared/ or libs/; a unit's own shared/ data stays inside it.
// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'units-imported-by-name',
      severity: 'error',
      from: {
        path: '^((?:apps|shared|libs)/[^/]+)/',
      },
      to: {
        path: '^(?:apps|shared|libs)/',
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
        pathNot: '^(?:apps|shared|libs)/',
      },
      to: {
        path: '^(?:apps|shared|libs)/',
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
      name: 'shared-knows-no-app',
      severity: 'error',
      from: {
        path: '^shared/',
      },
      to: {
        path: '^apps/',
      },
    },
    {
      name: 'libs-know-no-product',
      severity: 'error',
      from: {
        path: '^libs/',
      },
      to: {
        path: '^(?:apps|shared)/',
      },
    },
  ],
};
