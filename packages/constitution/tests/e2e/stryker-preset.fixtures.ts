import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { appliedUnit } from './applied-unit.fixtures';
import { installedIn, nodeBinary, toolEnvironment, writeFiles } from './package.fixtures';
import { linesOf, widestAppliedUnit } from './preset-load.fixtures';

interface Mutation {
  readonly passed: boolean;
  readonly survivors: number;
}

const stryker = nodeBinary('stryker');

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

const configOf = (unit: string): z.infer<typeof strykerConfig> =>
  strykerConfig.parse(JSON.parse(readFileSync(join(unit, 'stryker.config.json'), 'utf8')));

const appliedConfig = (blocks: readonly string[] = []): z.infer<typeof strykerConfig> =>
  configOf(strykerUnit(blocks));

const config = (unit: string): string =>
  JSON.stringify({
    ...configOf(unit),
    plugins: [
      fileURLToPath(import.meta.resolve('@droneey/mutation-check-typescript/runner')),
      fileURLToPath(import.meta.resolve('@droneey/mutation-check-typescript/ignorers')),
    ],
  });

const SANDBOX = 'src/__tests__/sandbox.fixtures.ts';
const SURVIVED = /\[Survived\]/g;

const TOTAL = 'export const total = (price: number, tax: number): number => price + tax;\n';

interface MutationInput {
  readonly blocks?: readonly string[];
  readonly source?: string;
  readonly spec: string;
}

interface StrykerRun {
  readonly status: number | undefined;
  readonly stdout: string;
}

const strykerRunIn = (input: { source?: string; spec: string; unit: string }): StrykerRun => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-stryker-'));

  try {
    const files = {
      'bunfig.mutation.toml': readFileSync(join(input.unit, 'bunfig.mutation.toml'), 'utf8'),
      'package.json': JSON.stringify({
        name: 'fixture',
        type: 'module',
      }),
      'src/__tests__/order.utils.test.ts': input.spec,
      [SANDBOX]: readFileSync(join(input.unit, SANDBOX), 'utf8'),
      'src/order.utils.ts': input.source ?? TOTAL,
      'stryker.config.json': config(input.unit),
    };

    writeFiles({
      files,
      folder,
    });

    // Why: Stryker's plugins and the specs' runner resolve from this package's install.
    const running = spawnSync(
      process.execPath,
      [
        '--bun',
        stryker,
        'run',
      ],
      {
        cwd: installedIn(folder),
        encoding: 'utf8',
        env: toolEnvironment(),
      },
    );

    return {
      status: running.status ?? undefined,
      stdout: running.stdout,
    };
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

const mutationOf = (input: MutationInput): Mutation => {
  const run = strykerRunIn({
    ...input,
    unit: strykerUnit(input.blocks ?? []),
  });

  return {
    passed: run.status === 0,
    survivors: [
      ...run.stdout.matchAll(SURVIVED),
    ].length,
  };
};

interface Validation {
  readonly passed: boolean;
  readonly warnings: readonly string[];
}

const WARNING = / WARN OptionsValidator\b/;

const widestWarnings = (spec: string): Validation => {
  const run = strykerRunIn({
    spec,
    unit: widestAppliedUnit('stryker'),
  });

  return {
    passed: run.status === 0,
    warnings: linesOf(run.stdout).filter((line) => WARNING.test(line)),
  };
};

export { appliedConfig, mutationOf, widestWarnings };
