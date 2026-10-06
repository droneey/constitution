import { DELIVERY, ROOT, SPECS } from './core.mjs';

const MESSAGES = [
  'node_modules/@lingui/',
  '/locales/',
];
// A UI's components and widgets outside libs/, the screens, root/ and the catalogs themselves.
const HOME = [
  '^src/(?!libs/).*/ui/',
  ...DELIVERY,
  ...ROOT,
  '/locales/',
  ...SPECS,
];

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // dependency-cruiser takes the severity of the first part in extends with allowed rules, warn by default.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'lingui-only-where-text-is-rendered',
      from: {
        path: HOME,
      },
      to: {
        path: MESSAGES[0],
      },
    },
  ],
  forbidden: [
    {
      name: 'lingui-only-in-its-home',
      severity: 'error',
      from: {
        pathNot: HOME,
      },
      to: {
        path: MESSAGES,
      },
    },
  ],
};
