import { fileURLToPath } from 'node:url';

// biome-ignore lint/style/noDefaultExport: Stryker reads a configuration's default export
export default {
  testRunner: 'bun-specs',
  // Stryker resolves a relative plugin from where it runs; the archive holds the runner beside its
  // presets, so a path from this file finds it from a unit of a workspace as from the root.
  plugins: [
    fileURLToPath(new URL('../../../../tools/mutation-check/dist/runner.js', import.meta.url)),
  ],
  coverageAnalysis: 'off',
};
