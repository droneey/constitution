// biome-ignore lint/style/noDefaultExport: syncpack reads a configuration's default export
export default {
  versionGroups: [
    {
      label: 'A dependency comes only from a registry',
      dependencyTypes: [
        'dev',
        'prod',
        'peer',
      ],
      specifierTypes: [
        'git',
        'url',
      ],
      isBanned: true,
    },
  ],
};
