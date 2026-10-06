import { ROOT, SPECS } from './core.mjs';

const HOME = [
  '^src/features/[^/]+/app/',
  '^src/composition/',
  ...ROOT,
  ...SPECS,
];
const QUERY = 'node_modules/@tanstack/react-query/';

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // dependency-cruiser takes the severity of the first part in extends with allowed rules, warn by default.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'query-library-home-is-the-binding-units',
      from: {
        path: HOME,
      },
      to: {
        path: QUERY,
      },
    },
  ],
  forbidden: [
    {
      name: 'query-library-only-in-its-home',
      severity: 'error',
      from: {
        pathNot: HOME,
      },
      to: {
        path: QUERY,
      },
    },
  ],
};
