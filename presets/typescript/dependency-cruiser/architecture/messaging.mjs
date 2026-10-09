import { ADAPTERS } from './core.mjs';

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'consumers-and-jobs-reached-only-from-entries',
      severity: 'error',
      from: {
        path: '^src/(features|shared|libs|kernel|contracts|composition)/',
      },
      to: {
        path: '^src/(consumers|jobs)/',
      },
    },
    {
      name: 'adapters-know-no-consumers-or-jobs',
      severity: 'error',
      from: {
        path: ADAPTERS,
      },
      to: {
        path: '^src/(consumers|jobs)/',
      },
    },
  ],
};
