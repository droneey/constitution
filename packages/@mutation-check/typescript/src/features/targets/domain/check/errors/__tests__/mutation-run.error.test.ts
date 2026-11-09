import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

import { MutationRunError, MutationRunFailure } from '../mutation-run.error.ts';

const goldenFilePath = join(import.meta.dir, 'mutation-run.error.golden.txt');

describe('MutationRunError', () => {
  it('should tell each failure by the message the golden file shows for its code', async () => {
    // Act
    const messages = [
      new MutationRunError({
        code: MutationRunFailure.ToolNotRun,
        toolName: 'stryker',
      }),
      new MutationRunError({
        code: MutationRunFailure.ToolTimedOut,
        toolName: 'stryker',
      }),
      new MutationRunError({
        code: MutationRunFailure.ToolStopped,
        toolName: 'stryker',
      }),
    ]
      .map(({ message }) => `${message}\n`)
      .join('');

    // Assert
    expect(messages).toBe(await Bun.file(goldenFilePath).text());
  });
});
