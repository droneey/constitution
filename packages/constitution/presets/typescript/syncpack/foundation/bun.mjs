// biome-ignore lint/style/noDefaultExport: syncpack reads a configuration's default export
export default {
  versionGroups: [
    {
      label: "The repository's own units use the workspace protocol",
      dependencies: [
        '$LOCAL',
      ],
      dependencyTypes: [
        'dev',
        'prod',
      ],
      pinVersion: 'workspace:*',
    },
  ],
};
