import { ADAPTERS } from './core.mjs';

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'adapters-know-no-commands',
      severity: 'error',
      from: {
        path: ADAPTERS,
      },
      to: {
        path: '^src/cli/',
      },
    },
  ],
};
