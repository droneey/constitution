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
          '^src/(features|composition)/[^/]+/(app|adapters)/',
          '^src/(kernel/contracts|adapters)/',
        ],
      },
    },
    {
      name: 'ui-reaches-no-mechanism',
      severity: 'error',
      from: {
        path: '^src/(features|composition)/([^/]+)/ui/',
      },
      to: {
        path: [
          '^src/$1/$2/(adapters|domain/contracts|domain/use-cases)/',
          '^src/(kernel/contracts|adapters)/',
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
        path: '^src/(features|composition)/[^/]+/app/use-cases/',
      },
      to: {
        path: [
          '^src/(features|composition)/[^/]+/(adapters|ui)/',
          '^src/adapters/',
        ],
      },
    },
  ],
};
