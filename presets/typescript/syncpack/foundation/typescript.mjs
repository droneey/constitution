// biome-ignore lint/style/noDefaultExport: syncpack reads a configuration's default export
export default {
  sortFirst: [
    'name',
    'version',
    'private',
    'description',
    'keywords',
    'homepage',
    'bugs',
    'license',
    'author',
    'repository',
    'type',
    'packageManager',
    'bin',
    'main',
    'module',
    'types',
    'exports',
    'imports',
    'files',
    'scripts',
    'workspaces',
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'peerDependenciesMeta',
  ],
  semverGroups: [
    {
      label: 'Pin the tools exactly',
      range: '',
      dependencyTypes: [
        'dev',
      ],
    },
    {
      label: 'Use caret ranges for the dependencies of the program',
      range: '^',
      dependencyTypes: [
        'prod',
      ],
    },
  ],
};
