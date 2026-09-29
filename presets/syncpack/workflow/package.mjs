// biome-ignore lint/style/noDefaultExport: syncpack reads a configuration's default export
export default {
  customTypes: {
    packageVersion: {
      path: 'version',
      strategy: 'version',
    },
  },
  versionGroups: [
    {
      label: 'Every package of the repository shares one version',
      dependencies: [
        'packageVersion',
      ],
      policy: 'sameRange',
    },
  ],
};
