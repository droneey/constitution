import { ROOT, SPECS } from './core.mjs';

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'only-the-root-imports-pino',
      severity: 'error',
      from: {
        pathNot: [
          ...ROOT,
          ...SPECS,
        ],
      },
      to: {
        path: 'node_modules/pino/',
      },
    },
  ],
};
