// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'root-takes-packages-by-name',
      severity: 'error',
      from: {
        pathNot: '^packages/',
      },
      to: {
        path: '^packages/',
      },
    },
  ],
  options: {
    preserveSymlinks: true,
  },
};
