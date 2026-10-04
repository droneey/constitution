import architecture from './.constitution/presets/typescript/knip/architecture/core.mjs';
import betterleaks from './.constitution/presets/typescript/knip/foundation/betterleaks.mjs';
import core from './.constitution/presets/typescript/knip/foundation/core.mjs';
import lsLint from './.constitution/presets/typescript/knip/foundation/ls-lint.mjs';
import mise from './.constitution/presets/typescript/knip/foundation/mise.mjs';
import osvScanner from './.constitution/presets/typescript/knip/foundation/osv-scanner.mjs';

export default {
  entry: [
    ...core.entry,
    ...architecture.entry,
    'tools/mutation-check/src/main.ts!',
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
    'mkfifo',
    'stryker',
  ],
  ignoreDependencies: [
    '@stryker-mutator/command-runner',
    'dclint',
    '@swc/core',
  ],
};
