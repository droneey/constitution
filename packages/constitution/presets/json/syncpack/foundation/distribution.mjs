// biome-ignore lint/style/noDefaultExport: syncpack reads a configuration's default export
export default {
  versionGroups: [
    {
      label: 'Peer dependencies keep their wider ranges',
      dependencyTypes: [
        'peer',
      ],
      isIgnored: true,
    },
  ],
  semverGroups: [
    {
      label: 'Use caret ranges for the dependencies of the program',
      range: '^',
      dependencyTypes: [
        'prod',
      ],
    },
  ],
};
