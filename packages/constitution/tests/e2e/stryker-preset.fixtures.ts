import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { appliedUnit } from './applied-unit.fixtures';

interface Mutation {
  passed: boolean;
  survivors: number;
}

const repository = join(import.meta.dir, '..', '..');
const stryker = join(repository, 'node_modules', '.bin', 'stryker');

const strykerUnit = (blocks: readonly string[] = []): string =>
  appliedUnit({
    blocks,
    implementations: [
      'bun',
      'bun-test',
      'stryker',
    ],
    languages: [
      'typescript',
    ],
  });

const strykerConfig = z.looseObject({
  plugins: z.array(z.string()),
  testRunner: z.string(),
});

const appliedConfig = (blocks: readonly string[] = []): z.infer<typeof strykerConfig> =>
  strykerConfig.parse(
    JSON.parse(readFileSync(join(strykerUnit(blocks), 'stryker.config.json'), 'utf8')),
  );

// The sources of the runner and the ignorer stand in for the distribution's build, which this
// repository never makes.
const config = (blocks: readonly string[]): string =>
  JSON.stringify({
    ...appliedConfig(blocks),
    plugins: [
      fileURLToPath(import.meta.resolve('@droneey/mutation-check-typescript/runner')),
      fileURLToPath(import.meta.resolve('@droneey/mutation-check-typescript/ignorers')),
    ],
  });

// The fixture the specs' preload names, which the presets write once beside the specs.
const SANDBOX = 'src/__tests__/sandbox.fixtures.ts';
const SURVIVED = /\[Survived\]/g;

const TOTAL = 'export const total = (price: number, tax: number): number => price + tax;\n';

interface MutationInput {
  /** the blocks of the unit beside its language's, Bun's and Stryker's */
  readonly blocks?: readonly string[];
  readonly source?: string;
  readonly spec: string;
}

const mutationOf = (input: MutationInput): Mutation => {
  const blocks = input.blocks ?? [];

  const folder = mkdtempSync(join(tmpdir(), 'constitution-stryker-'));

  try {
    const files = {
      'bunfig.mutation.toml': readFileSync(
        join(strykerUnit(blocks), 'bunfig.mutation.toml'),
        'utf8',
      ),
      'package.json': JSON.stringify({
        name: 'fixture',
        type: 'module',
      }),
      'src/__tests__/order.utils.test.ts': input.spec,
      [SANDBOX]: readFileSync(join(strykerUnit(blocks), SANDBOX), 'utf8'),
      'src/order.utils.ts': input.source ?? TOTAL,
      'stryker.config.json': config(blocks),
    };

    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(folder, path)), {
        recursive: true,
      });
      writeFileSync(join(folder, path), text);
    }

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

export { appliedConfig, mutationOf };
