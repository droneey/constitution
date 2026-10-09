import architecture from './.droneey/constitution/presets/typescript/knip/architecture/core.mjs';
import betterleaks from './.droneey/constitution/presets/typescript/knip/betterleaks.mjs';
import core from './.droneey/constitution/presets/typescript/knip/core.mjs';
import lsLint from './.droneey/constitution/presets/typescript/knip/ls-lint.mjs';
import mise from './.droneey/constitution/presets/typescript/knip/mise.mjs';
import osvScanner from './.droneey/constitution/presets/typescript/knip/osv-scanner.mjs';
import stryker from './.droneey/constitution/presets/typescript/knip/stryker.mjs';
import uv from './.droneey/constitution/presets/typescript/knip/uv.mjs';

export default {
  entry: [
    ...core.entry,
    ...architecture.entry,
    'tools/mutation-check/src/main.ts!',
    'tools/mutation-check/src/runner.ts!',
  ],
  project: [
    ...core.project,
    'tools/*/src/**/*.ts!',
    '!tools/*/src/**/__tests__/**!',
  ],
  ignoreBinaries: [
    ...betterleaks.ignoreBinaries,
    ...lsLint.ignoreBinaries,
    ...mise.ignoreBinaries,
    ...osvScanner.ignoreBinaries,
    ...uv.ignoreBinaries,
    'mkfifo',
    'stryker',
  ],
  ignoreDependencies: [
    ...stryker.ignoreDependencies,
    'dclint',
    '@swc/core',
  ],
};
