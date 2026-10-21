// biome-ignore lint/style/noDefaultExport: syncpack reads a configuration's default export
export default {
  semverGroups: [
    {
      label: 'Pin the tools exactly',
      range: '',
      dependencyTypes: [
        'dev',
      ],
    },
  ],
};
