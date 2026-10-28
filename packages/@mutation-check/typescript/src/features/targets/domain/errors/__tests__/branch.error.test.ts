import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { BranchError, BranchFailure } from '../branch.error.ts';

const goldenFilePath = join(import.meta.dir, 'branch.error.golden.txt');

const COMMAND = {
  args: [
    'diff',
    '--merge-base',
    'origin/main',
  ],
  folderPath: AbsolutePath.create('/work/packages/order'),
  toolName: 'git',
} as const;

describe('BranchError', () => {
  it('should tell each failure by the message the golden file shows for its code', async () => {
    // Act
    const messages = [
      new BranchError({
        code: BranchFailure.ToolNotRun,
        command: COMMAND,
      }),
      new BranchError({
        code: BranchFailure.ToolFailed,
        command: COMMAND,
        mainlineName: 'origin/main',
        stderr: "fatal: bad revision 'origin/main'",
      }),
      new BranchError({
        code: BranchFailure.ToolTimedOut,
        command: COMMAND,
      }),
      new BranchError({
        code: BranchFailure.OutputPastLimit,
        command: COMMAND,
      }),
    ]
      .map(({ message }) => `${message}\n`)
      .join('');

    // Assert
    expect(messages).toBe(await Bun.file(goldenFilePath).text());
  });
});
