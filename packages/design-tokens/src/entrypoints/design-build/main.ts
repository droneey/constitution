#!/usr/bin/env bun
import { pathToFileURL } from 'node:url';

import { confinedPathOf } from '#/libs/paths';
import { themeModesOf } from '#/libs/resolver';
import { buildAll, configsOf, isConfigOfMode } from '#/libs/style-dictionary';

import resolver from '../../../tokens/design.resolver.json' with { type: 'json' };

const resolverUrl = import.meta.resolve('../../../tokens/design.resolver.json');

const BUILD_COMMAND = 'build';

enum ExitCode {
  Success = 0,
  Failure = 1,
}

const writeError = (text: string): void => {
  process.stderr.write(text);
};

/** Builds each mode of the tokens with the configuration a module of the working folder exports. */
const runDesignCommand = async ([command, configPath]: readonly string[]): Promise<ExitCode> => {
  if (configPath === undefined || command !== BUILD_COMMAND) {
    writeError('usage: design-tokens build <config>\n');

    return ExitCode.Failure;
  }

  const path = confinedPathOf(process.cwd(), configPath);

  if (path === undefined) {
    writeError(`design-tokens: ${configPath} lies outside the working folder\n`);

    return ExitCode.Failure;
  }

  const configModule: unknown = await import(pathToFileURL(path).href);
  const configOf =
    typeof configModule === 'object' && configModule !== null && 'default' in configModule
      ? configModule.default
      : undefined;

  if (!isConfigOfMode(configOf)) {
    writeError(
      `design-tokens: ${configPath} exports no function from a mode to its configuration\n`,
    );

    return ExitCode.Failure;
  }

  const configs = configsOf(configOf, themeModesOf(resolver, resolverUrl));

  await buildAll(configs);

  return ExitCode.Success;
};

// The handler of last resort, the one catch that takes every failure.
try {
  process.exitCode = await runDesignCommand(process.argv.slice(2));
} catch (error) {
  writeError(`design-tokens: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = ExitCode.Failure;
}
