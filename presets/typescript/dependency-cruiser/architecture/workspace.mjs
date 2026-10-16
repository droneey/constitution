// A unit is a folder of products/, shared/ or libs/; a product's own shared/ data stays inside it.
// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'units-imported-by-name',
      severity: 'error',
      from: {
        path: '^((?:products|shared|libs)/[^/]+)/',
      },
      to: {
        path: '^(?:products|shared|libs)/',
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
        pathNot: '^(?:products|shared|libs)/',
      },
      to: {
        path: '^(?:products|shared|libs)/',
        dependencyTypes: [
          'local',
        ],
        dependencyTypesNot: [
          'aliased-workspace',
        ],
      },
    },
    {
      name: 'products-blind-to-each-other',
      severity: 'error',
      from: {
        path: '^products/([^/]+)/',
      },
      to: {
        path: '^products/',
        pathNot: '^products/$1/',
      },
    },
    {
      name: 'shared-knows-no-product',
      severity: 'error',
      from: {
        path: '^shared/',
      },
      to: {
        path: '^products/',
      },
    },
    {
      name: 'libs-know-no-product',
      severity: 'error',
      from: {
        path: '^libs/',
      },
      to: {
        path: '^(?:products|shared)/',
      },
    },
  ],
};
