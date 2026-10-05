import { readFileSync } from 'node:fs';
import { join, matchesGlob, relative } from 'node:path';

import { INSTRUMENTER_CONSTANTS } from '@stryker-mutator/api/core';
import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';
import type {
  DryRunResult,
  MutantRunOptions,
  MutantRunResult,
  TestRunner,
  TestRunnerCapabilities,
} from '@stryker-mutator/api/test-runner';
import { DryRunStatus, MutantRunStatus, TestStatus } from '@stryker-mutator/api/test-runner';

import { importsOf } from './imports.ts';
import { specsByFile } from './loaded.ts';

interface Run {
  failed: boolean;
  output: string;
}

const CONFIG = 'bunfig.mutation.toml';

const COMMAND = [
  'bun',
  `--config=./${CONFIG}`,
  'test',
  '--bail',
];

const SPECS = new Bun.Glob('**/*.test.{ts,tsx}');

const isTable = (table: unknown): table is Readonly<Record<string, unknown>> =>
  typeof table === 'object' && table !== null;

const settingsOf = (
  text: string,
): {
  ignored: readonly string[];
  root: string;
} => {
  const parsed: unknown = Bun.TOML.parse(text);
  const test = isTable(parsed) && isTable(parsed['test']) ? parsed['test'] : {};
  const ignored = test['pathIgnorePatterns'];
  const root = test['root'];

  return {
    ignored:
      Array.isArray(ignored) && ignored.every((pattern) => typeof pattern === 'string')
        ? ignored
        : [],
    root: typeof root === 'string' ? root : '.',
  };
};

const specsOf = (text: string): readonly string[] => {
  const { ignored, root } = settingsOf(text);

  return [
    ...SPECS.scanSync({
      cwd: root,
    }),
  ]
    .map((path) => relative('.', join(root, path)))
    .filter(
      (path) =>
        !(
          path.split('/').includes('node_modules') ||
          ignored.some((pattern) => matchesGlob(path, pattern))
        ),
    );
};

const runSpecs = (input: {
  env: Readonly<Record<string, string>>;
  started: (running: Bun.Subprocess) => void;
  specs: readonly string[];
}): Promise<Run> => {
  const running = Bun.spawn(
    [
      ...COMMAND,
      ...input.specs.map((spec) => `./${spec}`),
    ],
    {
      env: {
        ...Bun.env,
        ...input.env,
      },
      stderr: 'pipe',
      stdout: 'ignore',
    },
  );

  input.started(running);

  return Promise.all([
    new Response(running.stderr).text(),
    running.exited,
  ]).then(([output, code]) => ({
    failed: code !== 0,
    output,
  }));
};

// Runs each mutant only against the specs whose imports reach its file: the specs that prove it.
const specsRunner = (): TestRunner => {
  let running: Bun.Subprocess | undefined;
  let specs: ReadonlyMap<string, readonly string[]> = new Map();
  const started = (subprocess: Bun.Subprocess): void => {
    running = subprocess;
  };

  return {
    capabilities: (): TestRunnerCapabilities => ({
      reloadEnvironment: true,
    }),
    dispose: (): Promise<void> => {
      running?.kill();

      return Promise.resolve();
    },
    dryRun: async (): Promise<DryRunResult> => {
      const { failed, output } = await runSpecs({
        env: {},
        specs: [],
        started,
      });

      return failed
        ? {
            errorMessage: output,
            status: DryRunStatus.Error,
          }
        : {
            status: DryRunStatus.Complete,
            tests: [
              {
                id: 'all',
                name: 'All specs',
                status: TestStatus.Success,
                timeSpentMs: 0,
              },
            ],
          };
    },
    init: (): Promise<void> => {
      specs = specsByFile({
        importsOf,
        specs: specsOf(readFileSync(CONFIG, 'utf8')),
      });

      return Promise.resolve();
    },
    mutantRun: async (options: MutantRunOptions): Promise<MutantRunResult> => {
      const loaders = specs.get(relative('.', options.sandboxFileName)) ?? [];

      if (loaders.length === 0) {
        return {
          nrOfTests: 0,
          status: MutantRunStatus.Survived,
        };
      }

      const { failed, output } = await runSpecs({
        env: {
          [INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE]: options.activeMutant.id,
        },
        specs: loaders,
        started,
      });

      return failed
        ? {
            failureMessage: output,
            killedBy: [
              ...loaders,
            ],
            nrOfTests: loaders.length,
            status: MutantRunStatus.Killed,
          }
        : {
            nrOfTests: loaders.length,
            status: MutantRunStatus.Survived,
          };
    },
  };
};

specsRunner.inject = [] as const;

const strykerPlugins = [
  declareFactoryPlugin(PluginKind.TestRunner, 'bun-specs', specsRunner),
] as const;

export { strykerPlugins };
