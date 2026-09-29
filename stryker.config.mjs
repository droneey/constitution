import architecture from './.constitution/presets/stryker/architecture/core.mjs';
import core from './.constitution/presets/stryker/foundation/core.mjs';
import self from './.constitution/presets/stryker/foundation/self.mjs';

export default {
  ...self,
  ...core,
  commandRunner: {
    command: `${self.commandRunner.command} ./src ./tools`,
  },
  mutate: [
    ...core.mutate,
    ...architecture.mutate,
    'tools/*/src/**/*.ts',
    '!tools/*/src/**/__tests__/**',
    '!tools/*/src/main.ts',
  ],
};
