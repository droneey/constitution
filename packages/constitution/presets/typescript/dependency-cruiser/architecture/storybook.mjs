import { PACKAGES } from './core.mjs';

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // dependency-cruiser takes the severity of the first part in extends with allowed rules, warn by default.
  allowedSeverity: 'error',
  allowed: [
    {
      comment: 'stories-import-what-they-render-with',
      from: {
        path: '\\.stories\\.[^/]+$',
      },
      to: {
        dependencyTypes: PACKAGES,
      },
    },
  ],
};
