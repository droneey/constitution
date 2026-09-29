import architecture from './.constitution/presets/stryker/architecture/typescript.mjs';
import bunTest from './.constitution/presets/stryker/foundation/bun-test.mjs';
import core from './.constitution/presets/stryker/foundation/core.mjs';
import mise from './.constitution/presets/stryker/foundation/mise.mjs';
import self from './.constitution/presets/stryker/foundation/self.mjs';
import typescript from './.constitution/presets/stryker/foundation/typescript.mjs';

export default {
  ...self,
  ...mise,
  ...bunTest,
  ...core,
  commandRunner: {
    command: `${bunTest.commandRunner.command} ./src ./tools`,
  },
  mutate: [
    ...typescript.mutate,
    ...architecture.mutate,
    'tools/*/src/**/*.ts',
    '!tools/*/src/**/__tests__/**',
    '!tools/*/src/main.ts',
  ],
};
