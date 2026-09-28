// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'components-never-fetch',
      severity: 'error',
      from: {
        path: '/ui/components/',
      },
      to: {
        path: 'node_modules/ky/',
      },
    },
  ],
};
