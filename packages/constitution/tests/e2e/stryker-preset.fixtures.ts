import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

interface Mutation {
  passed: boolean;
  survivors: number;
}

const repository = join(import.meta.dir, '..', '..');
const stryker = join(repository, 'node_modules', '.bin', 'stryker');

// The sources of the runner and the ignorer stand in for the archive's build, which the check makes later.
const config = `import bunTest from './.droneey/constitution/presets/typescript/stryker/foundation/bun-test.mjs';
import core from './.droneey/constitution/presets/typescript/stryker/foundation/core.mjs';
import mise from './.droneey/constitution/presets/typescript/stryker/foundation/mise.mjs';
import self from './.droneey/constitution/presets/typescript/stryker/foundation/self.mjs';

export default {
  ...self,
  ...mise,
  ...bunTest,
  ...core,
  plugins: [
    '${fileURLToPath(import.meta.resolve('@droneey/mutation-check/runner'))}',
    '${fileURLToPath(import.meta.resolve('@droneey/mutation-check/ignorers'))}',
  ],
};
`;

const SURVIVED = /\[Survived\]/g;

const TOTAL = 'export const total = (price: number, tax: number): number => price + tax;\n';

const mutationOf = (spec: string, source = TOTAL): Mutation => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-stryker-'));

  try {
    const files = {
      'bunfig.mutation.toml': readFileSync(
        join(repository, 'templates', 'project', 'typescript', 'stryker', 'bunfig.mutation.toml'),
        'utf8',
      ),
      'package.json': JSON.stringify({
        name: 'fixture',
        type: 'module',
      }),
      'src/__tests__/order.utils.test.ts': spec,
      'src/order.utils.ts': source,
      'stryker.config.mjs': config,
    };

    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(folder, path)), {
        recursive: true,
      });
      writeFileSync(join(folder, path), text);
    }

    mkdirSync(join(folder, '.droneey'));
    symlinkSync(repository, join(folder, '.droneey', 'constitution'));
    // Stryker's plugins and the specs' runner resolve from this package's node_modules.
    symlinkSync(join(repository, 'node_modules'), join(folder, 'node_modules'));

    const running = spawnSync(
      'bun',
      [
        '--bun',
        stryker,
        'run',
      ],
      {
        cwd: folder,
        encoding: 'utf8',
      },
    );

    return {
      passed: running.status === 0,
      survivors: [
        ...running.stdout.matchAll(SURVIVED),
      ].length,
    };
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

export { mutationOf };
