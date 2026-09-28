// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'components-take-data-and-callbacks',
      severity: 'error',
      from: {
        path: '/ui/components/',
      },
      to: {
        path: [
          '^src/features/[^/]+/(app|adapters)/',
          '^src/(contracts|adapters)/',
        ],
      },
    },
    {
      name: 'ui-reaches-no-mechanism',
      severity: 'error',
      from: {
        path: '^src/features/([^/]+)/ui/',
      },
      to: {
        path: [
          '^src/features/$1/(adapters|domain/contracts|domain/use-cases)/',
          '^src/(contracts|adapters)/',
        ],
      },
    },
    {
      name: 'ui-takes-entities-as-types',
      severity: 'error',
      from: {
        path: '^src/features/([^/]+)/ui/',
      },
      to: {
        path: '^src/features/$1/domain/entities/',
        dependencyTypesNot: [
          'type-only',
        ],
      },
    },
  ],
};
