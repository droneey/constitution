// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'units-imported-by-name',
      severity: 'error',
      from: {
        path: '^((?:packages|libs)/[^/]+|shared)/',
      },
      to: {
        path: '^(?:packages|shared|libs)/',
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
        pathNot: '^(?:packages|shared|libs)/',
      },
      to: {
        path: '^(?:packages|shared|libs)/',
        dependencyTypes: [
          'local',
        ],
        dependencyTypesNot: [
          'aliased-workspace',
        ],
      },
    },
  ],
};
