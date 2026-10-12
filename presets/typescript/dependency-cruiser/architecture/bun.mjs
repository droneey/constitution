import { EDGE, SPECS } from './core.mjs';

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'bun-effects-reached-only-from-the-edge',
      severity: 'error',
      from: {
        path: '^src/',
        pathNot: [
          ...EDGE,
          ...SPECS,
        ],
      },
      to: {
        path: '^bun(?::|$)',
      },
    },
  ],
};
