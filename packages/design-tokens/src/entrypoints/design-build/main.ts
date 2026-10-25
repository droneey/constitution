#!/usr/bin/env bun
import { pathToFileURL } from 'node:url';

import { confinedPathOf } from '#/libs/paths';
import { buildAll, isConfigList, staleFilesOf } from '#/libs/style-dictionary';

enum DesignCommand {
  Build = 'build',
  Check = 'check',
}

/** a run's exit code: a stale file fails it as any failure does */
enum ExitCode {
  Success = 0,
  Failure = 1,
}

const writeError = (text: string): void => {
  process.stderr.write(text);
};

/** Builds the configurations a module of the working folder exports, or checks that what they write is current. */
const runDesignCommand = async ([command, configPath]: readonly string[]): Promise<ExitCode> => {
  if (
    configPath === undefined ||
    (command !== DesignCommand.Build && command !== DesignCommand.Check)
  ) {
    writeError('usage: design-tokens build|check <config>\n');

    return ExitCode.Failure;
  }

  const path = confinedPathOf(process.cwd(), configPath);

  if (path === undefined) {
    writeError(`design-tokens: ${configPath} lies outside the working folder\n`);

    return ExitCode.Failure;
  }

  const configModule: unknown = await import(pathToFileURL(path).href);
  const configs =
    typeof configModule === 'object' && configModule !== null && 'default' in configModule
      ? configModule.default
      : undefined;

  if (!isConfigList(configs)) {
    writeError(`design-tokens: ${configPath} exports no list of Style Dictionary configurations\n`);

    return ExitCode.Failure;
  }

  if (command === DesignCommand.Build) {
    await buildAll(configs);

    return ExitCode.Success;
  }

  const stale = await staleFilesOf(configs);

  if (stale.length > 0) {
    writeError(`stale, run bun run design:build: ${stale.join(', ')}\n`);

    return ExitCode.Failure;
  }

  return ExitCode.Success;
};

// The handler of last resort, the one catch that takes every failure.
try {
  process.exitCode = await runDesignCommand(process.argv.slice(2));
} catch (error) {
  writeError(`design-tokens: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = ExitCode.Failure;
}
