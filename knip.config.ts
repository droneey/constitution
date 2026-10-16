import architecture from './.droneey/constitution/presets/typescript/knip/architecture/core.mjs';
import betterleaks from './.droneey/constitution/presets/typescript/knip/betterleaks.mjs';
import core from './.droneey/constitution/presets/typescript/knip/core.mjs';
import mise from './.droneey/constitution/presets/typescript/knip/mise.mjs';
import osvScanner from './.droneey/constitution/presets/typescript/knip/osv-scanner.mjs';
import rumdl from './.droneey/constitution/presets/typescript/knip/rumdl.mjs';
import shellcheck from './.droneey/constitution/presets/typescript/knip/shellcheck.mjs';
import shfmt from './.droneey/constitution/presets/typescript/knip/shfmt.mjs';
import stryker from './.droneey/constitution/presets/typescript/knip/stryker.mjs';
import uv from './.droneey/constitution/presets/typescript/knip/uv.mjs';
import yamllint from './.droneey/constitution/presets/typescript/knip/yamllint.mjs';

export default {
  entry: [
    ...core.entry,
    ...architecture.entry,
    'tools/mutation-check/src/main.ts!',
    'tools/mutation-check/src/runner.ts!',
    'tools/mutation-check/src/ignorers.ts!',
  ],
  project: [
    ...core.project,
    'tools/*/src/**/*.ts!',
    '!tools/*/src/**/__tests__/**!',
  ],
  ignoreBinaries: [
    ...betterleaks.ignoreBinaries,
    ...mise.ignoreBinaries,
    ...osvScanner.ignoreBinaries,
    ...uv.ignoreBinaries,
    ...rumdl.ignoreBinaries,
    ...shellcheck.ignoreBinaries,
    ...shfmt.ignoreBinaries,
    ...yamllint.ignoreBinaries,
    'mkfifo',
    'renovate-config-validator',
    'stryker',
  ],
  ignoreDependencies: [
    ...stryker.ignoreDependencies,
    'dclint',
    '@swc/core',
  ],
};
