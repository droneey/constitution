import architecture from './.constitution/presets/knip/architecture/core.mjs';
import core from './.constitution/presets/knip/foundation/core.mjs';
import self from './.constitution/presets/knip/foundation/self.mjs';

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
    ...self.ignoreBinaries,
    'mkfifo',
    'stryker',
  ],
  ignoreDependencies: [
    '@stryker-mutator/command-runner',
    'dclint',
    '@swc/core',
  ],
};
