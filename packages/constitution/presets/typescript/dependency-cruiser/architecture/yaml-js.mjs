import { ADAPTERS, SPECS } from './core.mjs';

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'yaml-home-is-the-parsing-adapter-and-lib',
      severity: 'error',
      from: {
        pathNot: [
          ...ADAPTERS,
          '^src/libs/',
          ...SPECS,
        ],
      },
      to: {
        path: 'node_modules/yaml/',
      },
    },
  ],
};
