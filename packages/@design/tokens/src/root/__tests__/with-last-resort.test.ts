import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

import { ExitCode } from '#/features/themes';

import { lastResortTexts, runUnderLastResort } from './with-last-resort.fixtures';

const goldenFilePath = join(import.meta.dir, 'with-last-resort.golden.txt');

describe('withLastResort', () => {
  it.each([
    {
      condition: 'the run ends with success',
      failure: undefined,
      exitCode: ExitCode.Success,
    },
    {
      condition: 'the run throws',
      failure: new Error('the build failed'),
      exitCode: ExitCode.Failure,
    },
  ])('should end with the exit code $exitCode when $condition', async ({ failure, exitCode }) => {
    // Act
    const run = await runUnderLastResort(failure);

    // Assert
    expect(run.exitCode).toBe(exitCode);
  });

  it('should write the failures it ends as the golden file shows them', async () => {
    // Act
    const errorText = await lastResortTexts();

    // Assert
    expect(errorText).toBe(await Bun.file(goldenFilePath).text());
  });
});
