// A production file imports no development dependency. The configuration builds the rule over the
// development files every part names, the files that never ship.
export const forbiddenOver = (developmentFiles) => [
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
];
