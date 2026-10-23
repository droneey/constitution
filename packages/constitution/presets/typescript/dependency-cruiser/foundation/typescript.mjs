// A production file imports no development dependency. The configuration builds the rule over the
// development files every part and the project's own settings name, the files that never ship.
export const settingsOver = (developmentFiles) => ({
  forbidden: [
    {
      name: 'no-development-dependency-in-production',
      severity: 'error',
      from: {
        path: '^src/',
        pathNot: developmentFiles,
      },
      to: {
        dependencyTypes: [
          'npm-dev',
        ],
        dependencyTypesNot: [
          'type-only',
          'npm-peer',
        ],
        pathNot: 'node_modules/@types/',
      },
    },
  ],
});
