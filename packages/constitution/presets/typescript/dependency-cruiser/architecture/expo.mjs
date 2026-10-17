// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'ui-imports-no-expo-router',
      severity: 'error',
      from: {
        path: '/ui/',
      },
      to: {
        path: 'node_modules/expo-router/',
      },
    },
  ],
};
