import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

import { nothingChangedMessage, unknownArgumentsMessage } from '../check-mutations.messages.ts';

const goldenFilePath = join(import.meta.dir, 'check-mutations.messages.golden.txt');

describe('the messages of the command', () => {
  it('should read as the golden file shows them', async () => {
    // Act
    const messages = [
      nothingChangedMessage,
      unknownArgumentsMessage({
        args: 'everything',
        everythingArgument: 'all',
      }),
    ].join('');

    // Assert
    expect(messages).toBe(await Bun.file(goldenFilePath).text());
  });
});
