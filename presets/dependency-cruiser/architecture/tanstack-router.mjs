import { ROOT_CALLERS } from './core.mjs';

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
