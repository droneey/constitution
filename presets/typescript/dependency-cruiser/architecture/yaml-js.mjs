import { ADAPTERS, SPECS } from './core.mjs';

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'yaml-only-at-the-edge',
      severity: 'error',
      from: {
        pathNot: [
          ...ADAPTERS,
          '^src/libs/yaml/',
          ...SPECS,
        ],
      },
      to: {
        path: 'node_modules/yaml/',
      },
    },
  ],
};
