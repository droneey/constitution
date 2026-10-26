import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { ConfigurationError, ConfigurationFailure } from './configuration.error.ts';

const CONFIG_FILES = [
  'stryker.config.mjs',
  'stryker.config.js',
  'stryker.config.json',
] as const;

interface StrykerConfiguration {
  readonly mutate: readonly string[];
}

// Bun imports a JSON file too, its value the default export.
const configIn = async (path: string): Promise<unknown> => {
  const module: Readonly<Record<string, unknown>> = await import(pathToFileURL(path).href);

  return module['default'];
};

/**
 * The Stryker configuration of the folder, read once at start.
 *
 * @throws {@link ConfigurationError} when the folder has none, or its `mutate` is no list of
 * patterns.
 */
const strykerConfigurationIn = async (folder: string): Promise<StrykerConfiguration> => {
  const file = CONFIG_FILES.find((name) => existsSync(join(folder, name)));

  if (file === undefined) {
    throw new ConfigurationError({
      code: ConfigurationFailure.Missing,
      details: {
        files: CONFIG_FILES,
      },
    });
  }

  const config = await configIn(join(folder, file));
  const mutate =
    typeof config === 'object' && config !== null && 'mutate' in config ? config.mutate : undefined;

  if (!(Array.isArray(mutate) && mutate.every((pattern) => typeof pattern === 'string'))) {
    throw new ConfigurationError({
      code: ConfigurationFailure.MutateMalformed,
      details: {
        files: [
          file,
        ],
      },
    });
  }

  return {
    mutate,
  };
};

export { strykerConfigurationIn };
