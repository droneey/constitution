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
  ],
};
