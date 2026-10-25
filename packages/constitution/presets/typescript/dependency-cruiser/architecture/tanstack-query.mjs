import { ROOT, SPECS } from './core.mjs';

const HOME = [
  '^src/(features|composition)/[^/]+/app/',
  ...ROOT,
  ...SPECS,
];
const QUERY = 'node_modules/@tanstack/react-query/';

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // allowedSeverity is warn unless set.
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
