import { PACKAGES } from './core.mjs';

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // allowedSeverity is warn unless set.
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
