// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'components-never-query',
      severity: 'error',
      from: {
        path: '/ui/components/',
      },
      to: {
        path: 'node_modules/@tanstack/react-query/',
      },
    },
  ],
};
