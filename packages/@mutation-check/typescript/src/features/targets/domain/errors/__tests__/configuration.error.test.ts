import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

import { ConfigurationError, ConfigurationFailure } from '../configuration.error.ts';

const goldenFilePath = join(import.meta.dir, 'configuration.error.golden.txt');

describe('ConfigurationError', () => {
  it('should tell each failure by the message the golden file shows for its code', async () => {
    // Act
    const messages = [
      new ConfigurationError({
        code: ConfigurationFailure.Missing,
        fileNames: [
          'stryker.config.mjs',
          'stryker.config.json',
        ],
      }),
      new ConfigurationError({
        code: ConfigurationFailure.Unreadable,
        fileName: 'stryker.config.mjs',
      }),
      new ConfigurationError({
        code: ConfigurationFailure.MutateMalformed,
        fileName: 'stryker.config.json',
        problemPaths: [
          'default.mutate',
          'default.mutate.1',
        ],
      }),
    ]
      .map(({ message }) => `${message}\n`)
      .join('');

    // Assert
    expect(messages).toBe(await Bun.file(goldenFilePath).text());
  });
});
