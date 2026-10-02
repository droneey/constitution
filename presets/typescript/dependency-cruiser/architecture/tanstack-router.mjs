import { ADAPTERS, ROOT_CALLERS } from './core.mjs';

const ROUTER = 'node_modules/@tanstack/react-router/';

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
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
      name: 'router-primitives-only-in-screens-and-widgets',
      severity: 'error',
      from: {
        pathNot: [
          '^src/routes/',
          '/ui/widgets/',
          '/-hooks/',
          '^src/router\\.[^/]+$',
          '^src/root/',
          '(^|/)__tests__/',
        ],
      },
      to: {
        path: ROUTER,
      },
    },
    {
      name: 'routes-reached-only-from-the-router',
      severity: 'error',
      from: {
        path: '^src/(features|shared|libs|kernel|contracts|composition)/',
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
    {
      name: 'libs-never-route',
      severity: 'error',
      from: {
        path: '^src/libs/',
      },
      to: {
        path: ROUTER,
      },
    },
    {
      name: 'screen-pieces-never-navigate',
      severity: 'error',
      from: {
        path: '/-components/',
      },
      to: {
        path: ROUTER,
      },
    },
  ],
};
