import base from './.constitution/presets/knip/base.mjs';

export default {
  ...base,
  ignoreBinaries: [
    ...base.ignoreBinaries,
    'mkfifo',
  ],
  ignoreDependencies: [
    '@droneey/devkit-ts-dependency-cruiser',
    '@stryker-mutator/command-runner',
    '@swc/core',
  ],
};
