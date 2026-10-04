// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'feature-root-reached-only-through-its-layers',
      severity: 'error',
      from: {},
      to: {
        path: '^src/features/[^/]+/(?!(?:domain|app|adapters|ui|__tests__)/|index\\.[^/]+$)',
      },
    },
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
      name: 'components-never-import-widgets',
      severity: 'error',
      from: {
        path: '/ui/components/',
      },
      to: {
        path: '/ui/widgets/',
      },
    },
    {
      name: 'binding-units-reach-no-adapter-or-ui',
      severity: 'error',
      from: {
        path: '^src/features/([^/]+)/app/use-cases/',
      },
      to: {
        path: [
          '^src/features/[^/]+/(adapters|ui)/',
          '^src/adapters/',
        ],
      },
    },
  ],
};
