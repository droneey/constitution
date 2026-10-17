// A domain, its use cases among it, and an adapter send no event; a delivery unit of app/ or ui/ does.
// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'features-never-track',
      severity: 'error',
      from: {
        path: '^src/(features|composition)/[^/]+/(domain|adapters)/',
      },
      to: {
        path: [
          '/sinks/',
          '^src/adapters/analytics/',
          '^src/kernel/contracts/analytics',
        ],
      },
    },
  ],
};
