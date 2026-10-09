import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

interface Mutation {
  passed: boolean;
  survivors: number;
}

const REPOSITORY = join(import.meta.dir, '..', '..');
const STRYKER = join(REPOSITORY, 'node_modules', '.bin', 'stryker');

// The runner's source stands in for the archive's build, which the check makes later.
const CONFIG = `import bunTest from './.droneey/constitution/presets/typescript/stryker/bun-test.mjs';
import core from './.droneey/constitution/presets/typescript/stryker/core.mjs';
import mise from './.droneey/constitution/presets/typescript/stryker/mise.mjs';
import self from './.droneey/constitution/presets/typescript/stryker/self.mjs';

export default {
  ...self,
  ...mise,
  ...bunTest,
  ...core,
  plugins: [
    '${join(REPOSITORY, 'tools', 'mutation-check', 'src', 'runner.ts')}',
  ],
};
`;

const SURVIVED = /\[Survived\]/g;

// The project reaches Stryker's plugins and the specs' runner through this
// repository's node_modules.
const mutationOf = (spec: string): Mutation => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-stryker-'));
  const files = {
    'bunfig.mutation.toml': readFileSync(
      join(REPOSITORY, 'templates', 'project', 'bun', 'bunfig.mutation.toml'),
      'utf8',
    ),
    'package.json': JSON.stringify({
      name: 'fixture',
      type: 'module',
    }),
    'src/__tests__/order.utils.test.ts': spec,
    'src/order.utils.ts':
      'export const total = (price: number, tax: number): number => price + tax;\n',
    'stryker.config.mjs': CONFIG,
  };

  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), text);
  }

  mkdirSync(join(folder, '.droneey'));
  symlinkSync(REPOSITORY, join(folder, '.droneey', 'constitution'));
  symlinkSync(join(REPOSITORY, 'node_modules'), join(folder, 'node_modules'));

  const running = spawnSync(
    'bun',
    [
      '--bun',
      STRYKER,
      'run',
    ],
    {
      cwd: folder,
      encoding: 'utf8',
    },
  );

  rmSync(folder, {
    force: true,
    recursive: true,
  });

  return {
    passed: running.status === 0,
    survivors: [
      ...running.stdout.matchAll(SURVIVED),
    ].length,
  };
};

export { mutationOf };
