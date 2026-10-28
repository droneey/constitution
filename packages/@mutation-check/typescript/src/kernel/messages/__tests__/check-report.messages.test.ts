import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

import { reportLineOf, unexpectedErrorMessage } from '../check-report.messages.ts';

const goldenFilePath = join(import.meta.dir, 'check-report.messages.golden.txt');

describe('the messages of the check report', () => {
  it('should read as the golden file shows them', async () => {
    // Act
    const messages = [
      reportLineOf('a text'),
      reportLineOf(unexpectedErrorMessage(new TypeError('x is not a function'))),
    ].join('');

    // Assert
    expect(messages).toBe(await Bun.file(goldenFilePath).text());
  });
});
