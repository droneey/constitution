import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';
import type { TestRunner } from '@stryker-mutator/api/test-runner';

import { AbsolutePath } from '#/kernel/value-objects';
import { runSpecsIn } from '#/root';

import { bunSpecsRunner } from './bun-specs-runner.ts';

/**
 * @throws {SpecSettingsError} when the unit's configuration of the specs is not of the shape
 * `bun test` reads
 */
const specsRunner = (): TestRunner => {
  const unitFolderPath = AbsolutePath.create(process.cwd());

  return bunSpecsRunner({
    runSpecs: runSpecsIn({
      environment: process.env,
      unitFolderPath,
    }),
    unitFolderPath,
  });
};

specsRunner.inject = [] as const;

/** the `bun-specs` runner, which runs the unit's specs with `bun test` */
const STRYKER_PLUGINS = [
  declareFactoryPlugin(PluginKind.TestRunner, 'bun-specs', specsRunner),
] as const;

export { STRYKER_PLUGINS as strykerPlugins };
