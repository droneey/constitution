import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

import { SpecSettingsError, SpecSettingsFailure } from '../spec-settings.error.ts';

const goldenFilePath = join(import.meta.dir, 'spec-settings.error.golden.txt');

describe('SpecSettingsError', () => {
  it('should tell each failure by the message the golden file shows for its code', async () => {
    // Act
    const messages = [
      new SpecSettingsError({
        code: SpecSettingsFailure.Missing,
        fileName: 'bunfig.mutation.toml',
      }),
      new SpecSettingsError({
        code: SpecSettingsFailure.Unparsable,
        fileName: 'bunfig.mutation.toml',
      }),
      new SpecSettingsError({
        code: SpecSettingsFailure.Malformed,
        fileName: 'bunfig.mutation.toml',
        problemPaths: [
          'test.pathIgnorePatterns.0',
          'test.root',
        ],
      }),
    ]
      .map(({ message }) => `${message}\n`)
      .join('');

    // Assert
    expect(messages).toBe(await Bun.file(goldenFilePath).text());
  });
});
