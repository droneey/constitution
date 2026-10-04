import architecture from './.droneey/constitution/presets/typescript/stryker/architecture/core.mjs';
import bunTest from './.droneey/constitution/presets/typescript/stryker/foundation/bun-test.mjs';
import core from './.droneey/constitution/presets/typescript/stryker/foundation/core.mjs';
import git from './.droneey/constitution/presets/typescript/stryker/foundation/git.mjs';
import mise from './.droneey/constitution/presets/typescript/stryker/foundation/mise.mjs';
import self from './.droneey/constitution/presets/typescript/stryker/foundation/self.mjs';

export default {
  ...self,
  ...git,
  ...mise,
  ...bunTest,
  ...core,
  ignorePatterns: [
    ...git.ignorePatterns,
    ...mise.ignorePatterns,
  ],
  commandRunner: {
    command: `${bunTest.commandRunner.command} ./src ./tools`,
  },
  mutate: [
    ...core.mutate,
    ...architecture.mutate,
    'tools/*/src/**/*.ts',
    '!tools/*/src/**/__tests__/**',
    '!tools/*/src/main.ts',
  ],
};
