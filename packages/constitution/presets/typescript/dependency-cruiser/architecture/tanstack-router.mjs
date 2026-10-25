import { ROOT, SPECS } from './core.mjs';

const ROUTER = 'node_modules/@tanstack/react-router/';
// The root: its routes, the router's file and the navigation it hands down.
const HOME = [
  ...ROOT,
  ...SPECS,
];

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // allowedSeverity is warn unless set.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'router-primitives-only-in-the-root',
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
      name: 'router-only-in-its-home',
      severity: 'error',
      from: {
        pathNot: HOME,
      },
      to: {
        path: ROUTER,
      },
    },
  ],
};
