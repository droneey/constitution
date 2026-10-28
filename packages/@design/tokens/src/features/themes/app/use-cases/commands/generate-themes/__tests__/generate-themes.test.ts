import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

import { ExitCode } from '../../../../constants';
import {
  CONFIG_PATH,
  failureTexts,
  GENERATE_ARGS,
  refusals,
  runWith,
} from './generate-themes.fixtures';

const goldenFilePath = join(import.meta.dir, 'generate-themes.golden.txt');

describe('runGenerateThemes', () => {
  it('should generate the themes with the module the command names', async () => {
    // Act
    const run = await runWith(GENERATE_ARGS);

    // Assert
    expect(run.generatedPaths).toStrictEqual([
      CONFIG_PATH,
    ]);
  });

  it.each([
    {
      condition: 'the themes are generated',
      args: GENERATE_ARGS,
      failure: undefined,
      exitCode: ExitCode.Success,
    },
    {
      condition: 'it is given no module',
      args: [
        'generate',
      ],
      failure: undefined,
      exitCode: ExitCode.Failure,
    },
    {
      condition: 'it is given a second module',
      args: [
        ...GENERATE_ARGS,
        'other.config.ts',
      ],
      failure: undefined,
      exitCode: ExitCode.Failure,
    },
    {
      condition: 'it is given another command',
      args: [
        'build',
        CONFIG_PATH,
      ],
      failure: undefined,
      exitCode: ExitCode.Failure,
    },
    {
      condition: 'the generation refuses the module',
      args: GENERATE_ARGS,
      failure: refusals[0],
      exitCode: ExitCode.Failure,
    },
  ])(
    'should end with the exit code $exitCode when $condition',
    async ({ args, failure, exitCode }) => {
      // Act
      const run = await runWith(args, failure);

      // Assert
      expect(run.exitCode).toBe(exitCode);
    },
  );

  it('should write its failures as the golden file shows them', async () => {
    // Act
    const errorText = await failureTexts();

    // Assert
    expect(errorText).toBe(await Bun.file(goldenFilePath).text());
  });

  it('should let a failure it does not recognise through', async () => {
    // Arrange
    const failure = new Error('the build failed');

    // Act
    const running = runWith(GENERATE_ARGS, failure);

    // Assert
    await expect(running).rejects.toBe(failure);
  });
});
