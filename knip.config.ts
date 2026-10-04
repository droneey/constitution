import architecture from './.droneey/constitution/presets/typescript/knip/architecture/core.mjs';
import betterleaks from './.droneey/constitution/presets/typescript/knip/foundation/betterleaks.mjs';
import core from './.droneey/constitution/presets/typescript/knip/foundation/core.mjs';
import lsLint from './.droneey/constitution/presets/typescript/knip/foundation/ls-lint.mjs';
import mise from './.droneey/constitution/presets/typescript/knip/foundation/mise.mjs';
import osvScanner from './.droneey/constitution/presets/typescript/knip/foundation/osv-scanner.mjs';
import stryker from './.droneey/constitution/presets/typescript/knip/foundation/stryker.mjs';
import uv from './.droneey/constitution/presets/typescript/knip/foundation/uv.mjs';

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
