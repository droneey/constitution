import { EDGE, PACKAGE_SURFACE, SPECS } from './core.mjs';

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
          PACKAGE_SURFACE,
        ],
      },
      to: {
        path: '^bun(?::|$)',
        reachable: true,
      },
    },
  ],
};
