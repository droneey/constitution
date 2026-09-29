import architecture from './.constitution/presets/knip/architecture/core.mjs';
import betterleaks from './.constitution/presets/knip/foundation/betterleaks.mjs';
import core from './.constitution/presets/knip/foundation/core.mjs';
import lsLint from './.constitution/presets/knip/foundation/ls-lint.mjs';
import mise from './.constitution/presets/knip/foundation/mise.mjs';
import osvScanner from './.constitution/presets/knip/foundation/osv-scanner.mjs';
import lefthook from './.constitution/presets/knip/workflow/lefthook.mjs';

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
    ...lefthook.ignoreBinaries,
    'mkfifo',
    'stryker',
  ],
  ignoreDependencies: [
    '@stryker-mutator/command-runner',
    'dclint',
    '@swc/core',
  ],
};
