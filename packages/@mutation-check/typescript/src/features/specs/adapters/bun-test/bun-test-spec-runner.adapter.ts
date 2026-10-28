import { existsSync, readFileSync } from 'node:fs';
import { join, matchesGlob, relative } from 'node:path';

import { PATH_SEPARATOR } from '#/kernel/constants';
import type { AbsolutePath } from '#/kernel/value-objects';
import { UnitRelativePath } from '#/kernel/value-objects';
import { recognise } from '#/libs/errors';
import { problemPathsOf } from '#/libs/schemas';

import type { SpecRunner } from '../../domain/contracts';
import type { SpecRun } from '../../domain/entities';
import { SpecRunStatus } from '../../domain/entities';
import { SpecSettingsError, SpecSettingsFailure } from '../../domain/errors';
import type { SpecSettings } from './spec-settings.model.ts';
import { specSettingsModel } from './spec-settings.model.ts';
import { streamTextOf } from './stream-text.utils.ts';

interface BunTestSpecRunnerInput {
  readonly env: Readonly<Record<string, string>>;
  readonly outputLimitBytes: number;
  readonly unitFolderPath: AbsolutePath;
}

const CONFIG_FILE_NAME = 'bunfig.mutation.toml';
const DEPENDENCY_FOLDER_NAME = 'node_modules';

const configOption = `--config=./${CONFIG_FILE_NAME}`;

// Why: a mutant's verdict needs no case past the first failure.
const COMMAND = [
  'bun',
  configOption,
  'test',
  '--bail',
] as const;

const specGlob = new Bun.Glob('**/*.test.{ts,tsx}');

const isSyntaxError = (caught: unknown): boolean => caught instanceof SyntaxError;

/** @throws {SpecSettingsError} when the text is no TOML */
const tomlOf = (configText: string): unknown => {
  try {
    return Bun.TOML.parse(configText);
  } catch (error) {
    recognise({
      caught: error,
      isRecognised: isSyntaxError,
    });

    throw new SpecSettingsError(
      {
        code: SpecSettingsFailure.Unparsable,
        fileName: CONFIG_FILE_NAME,
      },
      {
        cause: error,
      },
    );
  }
};

/**
 * @throws {SpecSettingsError} when the unit has none, or it is no TOML of the shape
 * `bun test` reads
 */
const specSettingsIn = (unitFolderPath: AbsolutePath): SpecSettings['test'] => {
  const configPath = join(unitFolderPath, CONFIG_FILE_NAME);

  if (!existsSync(configPath)) {
    throw new SpecSettingsError({
      code: SpecSettingsFailure.Missing,
      fileName: CONFIG_FILE_NAME,
    });
  }

  const parsing = specSettingsModel.safeParse(
    // Stryker disable next-line StringLiteral: Bun reads the TOML's bytes as UTF-8 when no encoding is named
    tomlOf(readFileSync(configPath, 'utf8')),
  );

  if (!parsing.success) {
    throw new SpecSettingsError({
      code: SpecSettingsFailure.Malformed,
      fileName: CONFIG_FILE_NAME,
      problemPaths: problemPathsOf(parsing.error),
    });
  }

  return parsing.data.test;
};

const bunTestSpecRunner = (input: BunTestSpecRunnerInput): SpecRunner => ({
  /**
   * @throws {SpecSettingsError} when the unit has none, or it is no TOML of the shape `bun
   * test` reads
   */
  findSpecPaths: (): readonly UnitRelativePath[] => {
    const settings = specSettingsIn(input.unitFolderPath);
    const rootFolderPath = join(input.unitFolderPath, settings.root);

    return [
      ...specGlob.scanSync({
        cwd: rootFolderPath,
      }),
    ]
      .map((foundPath) => relative(input.unitFolderPath, join(rootFolderPath, foundPath)))
      .filter(
        (specPath) =>
          !(
            specPath.split(PATH_SEPARATOR).includes(DEPENDENCY_FOLDER_NAME) ||
            settings.pathIgnorePatterns.some((glob) => matchesGlob(specPath, glob))
          ),
      )
      .map(UnitRelativePath.create);
  },
  run: async (run): Promise<SpecRun> => {
    const timeoutSignal = AbortSignal.timeout(run.timeoutMs);
    const running = Bun.spawn(
      [
        ...COMMAND,
        ...run.specPaths.map((specPath) => `./${specPath}`),
      ],
      {
        cwd: input.unitFolderPath,
        env: {
          ...input.env,
          ...run.addedVariables,
        },
        signal: AbortSignal.any([
          run.signal,
          timeoutSignal,
        ]),
        stderr: 'pipe',
        stdout: 'ignore',
      },
    );
    const [stderrText, exitCode] = await Promise.all([
      streamTextOf({
        limitBytes: input.outputLimitBytes,
        stream: running.stderr,
      }),
      running.exited,
    ]);

    if (timeoutSignal.aborted) {
      return {
        status: SpecRunStatus.TimedOut,
      };
    }

    if (exitCode !== 0) {
      return {
        status: SpecRunStatus.Failed,
        stderrText,
      };
    }

    return {
      status: SpecRunStatus.Passed,
    };
  },
});

export { bunTestSpecRunner };
