import { ADAPTERS } from './core.mjs';

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'routes-reached-only-from-expo-router',
      severity: 'error',
      from: {
        path: '^src/(features|shared|libs|kernel|contracts|composition)/',
      },
      to: {
        path: '^src/routes/',
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
  ],
};
