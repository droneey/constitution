import { ADAPTERS, ROOT, ROOT_CALLERS, SPECS } from './core.mjs';

const ROUTER = 'node_modules/@tanstack/react-router/';
// The route files and their -hooks/, widgets, the router's file and root/; never -components/.
const HOME = [
  '^src/routes/(?!-components/|.*/-components/)',
  '/ui/widgets/',
  '^src/router\\.[^/]+$',
  ...ROOT,
  ...SPECS,
];

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // dependency-cruiser takes the severity of the first part in extends with allowed rules, warn by default.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'router-primitives-only-in-screens-and-widgets',
      from: {
        path: HOME,
      },
      to: {
        path: ROUTER,
      },
    },
  ],
  forbidden: [
    {
      name: 'root-reached-only-from-entries',
      severity: 'error',
      from: {
        pathNot: [
          ...ROOT_CALLERS,
          '^src/router\\.[^/]+$',
          '^src/routes/__root\\.[^/]+$',
        ],
      },
      to: {
        path: '^src/root/',
      },
    },
    {
      name: 'adapters-know-no-routes',
      severity: 'error',
      from: {
        path: ADAPTERS,
      },
      to: {
        path: '^src/routes/',
      },
    },
    {
      name: 'router-only-in-its-home',
      severity: 'error',
      from: {
        pathNot: HOME,
      },
      to: {
        path: ROUTER,
      },
    },
    {
      name: 'routes-reached-only-from-the-router',
      severity: 'error',
      from: {
        path: '^src/(features|shared|libs|kernel|contracts|composition|integrations)/',
      },
      to: {
        path: '^src/routes/',
      },
    },
    {
      name: 'route-pieces-never-import-route-files',
      severity: 'error',
      from: {
        path: [
          '^src/routes/-(components|hooks)/',
          '^src/routes/.*/-(components|hooks)/',
        ],
      },
      to: {
        path: '^src/routes/',
        pathNot: [
          '/-(components|hooks)/',
          '(^|/)__tests__/',
        ],
      },
    },
  ],
};
