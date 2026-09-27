// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'features-never-track',
      severity: 'error',
      from: {
        path: '^src/features/',
      },
      to: {
        path: [
          '/sinks/',
          '^src/(contracts|adapters)/analytics/',
        ],
      },
    },
  ],
};
