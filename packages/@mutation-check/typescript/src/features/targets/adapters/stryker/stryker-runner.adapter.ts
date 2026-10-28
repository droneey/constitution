import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { AbsolutePath, UnitRelativePath } from '#/kernel/value-objects';
import { recognise } from '#/libs/errors';
import { SpawnErrorCode, spawnErrorCodeOf } from '#/libs/processes';
import { problemPathsOf } from '#/libs/schemas';

import type { MutationRunner } from '../../domain/contracts';
import {
  ConfigurationError,
  ConfigurationFailure,
  MutationRunError,
  MutationRunFailure,
} from '../../domain/errors';
import { isMutatedBy } from './is-mutated-by.utils.ts';
import { strykerConfigurationModuleModel } from './models';
import { mutateArgumentsOf } from './mutate-arguments.utils.ts';

interface StrykerRunnerInput {
  readonly env: Readonly<Record<string, string>>;
  readonly output: 'inherit' | 'ignore';
  readonly timeoutMs: number;
  readonly unitFolderPath: AbsolutePath;
}

const TOOL_NAME = 'stryker';

const CONFIG_FILE_NAMES = [
  'stryker.config.mjs',
  'stryker.config.js',
  'stryker.config.json',
] as const;

// What Bun's import throws for a file it cannot load: a module it cannot parse or resolve, or a JSON
// text it cannot read.
const isImportFailure = (caught: unknown): boolean =>
  caught instanceof BuildMessage ||
  caught instanceof ResolveMessage ||
  caught instanceof SyntaxError;

/** @throws ConfigurationError when the file cannot be loaded */
const configurationModuleOf = async (input: {
  fileName: string;
  unitFolderPath: AbsolutePath;
}): Promise<unknown> => {
  try {
    return await import(pathToFileURL(join(input.unitFolderPath, input.fileName)).href);
  } catch (error) {
    recognise({
      caught: error,
      isRecognised: isImportFailure,
    });

    throw new ConfigurationError(
      {
        code: ConfigurationFailure.Unreadable,
        fileName: input.fileName,
      },
      {
        cause: error,
      },
    );
  }
};

/**
 * @throws ConfigurationError when the unit has none, it cannot be read, or its `mutate` is no
 * list of patterns.
 */
const mutateGlobsIn = async (unitFolderPath: AbsolutePath): Promise<readonly string[]> => {
  const fileName = CONFIG_FILE_NAMES.find((candidateName) =>
    existsSync(join(unitFolderPath, candidateName)),
  );

  if (fileName === undefined) {
    throw new ConfigurationError({
      code: ConfigurationFailure.Missing,
      fileNames: CONFIG_FILE_NAMES,
    });
  }

  const parsing = strykerConfigurationModuleModel.safeParse(
    await configurationModuleOf({
      fileName,
      unitFolderPath,
    }),
  );

  if (!parsing.success) {
    throw new ConfigurationError({
      code: ConfigurationFailure.MutateMalformed,
      fileName,
      problemPaths: problemPathsOf(parsing.error),
    });
  }

  return parsing.data.default.mutate;
};

// A Stryker that never ran reports an error, one killed at the time it is given reports it as timed
// out, and one stopped by any other signal reports none.
const failureOf = (error: Error | undefined): MutationRunFailure => {
  if (error === undefined) {
    return MutationRunFailure.ToolStopped;
  }

  return spawnErrorCodeOf(error) === SpawnErrorCode.TimedOut
    ? MutationRunFailure.ToolTimedOut
    : MutationRunFailure.ToolNotRun;
};

const strykerRunner = (input: StrykerRunnerInput): MutationRunner => ({
  mutatedOf: async (filePaths): Promise<readonly UnitRelativePath[]> =>
    filePaths.filter(isMutatedBy(await mutateGlobsIn(input.unitFolderPath))),
  run: (targets): number => {
    const done = spawnSync(
      TOOL_NAME,
      [
        'run',
        ...(targets === undefined ? [] : mutateArgumentsOf(targets)),
      ],
      {
        cwd: input.unitFolderPath,
        env: input.env,
        stdio: input.output,
        timeout: input.timeoutMs,
      },
    );

    if (done.status === null) {
      throw new MutationRunError(
        {
          code: failureOf(done.error),
          toolName: TOOL_NAME,
        },
        {
          cause: done.error ?? done.signal,
        },
      );
    }

    return done.status;
  },
});

export { strykerRunner };
