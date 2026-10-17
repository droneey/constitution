import { ADAPTERS, SPECS } from './core.mjs';

// The adapters, the client of a system under libs/, the shared mapper of its failures and the root that builds the instances.
const HOME = [
  ...ADAPTERS,
  '^src/libs/',
  '^src/shared/',
  '^src/root/',
  ...SPECS,
];

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // dependency-cruiser takes the severity of the first part in extends with allowed rules, warn by default.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'ky-home-is-the-adapters-libs-root-and-its-failure-mapper',
      from: {
        path: '^src/shared/',
      },
      to: {
        path: 'node_modules/ky/',
      },
    },
  ],
  forbidden: [
    {
      name: 'ky-home-is-the-adapters-libs-root-and-its-failure-mapper',
      severity: 'error',
      from: {
        pathNot: HOME,
      },
      to: {
        path: 'node_modules/ky/',
      },
    },
  ],
};
