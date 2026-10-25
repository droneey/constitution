import { describe, expect, it } from 'bun:test';

import { ConfigurationError, ConfigurationFailure } from '../configuration.error.ts';

describe('ConfigurationError', () => {
  it.each([
    {
      code: ConfigurationFailure.Missing,
      files: [
        'stryker.config.mjs',
        'stryker.config.json',
      ],
      text: 'no Stryker configuration (stryker.config.mjs, stryker.config.json); write one',
    },
    {
      code: ConfigurationFailure.MutateMalformed,
      files: [
        'stryker.config.mjs',
      ],
      text: 'stryker.config.mjs names no list of patterns as its mutate; name the files to mutate',
    },
  ])('should read as what is wrong and what to do when it is $code', ({ code, files, text }) => {
    // Arrange
    const input = {
      code,
      details: {
        files,
      },
    };

    // Act
    const error = new ConfigurationError(input);

    // Assert
    expect({
      name: error.name,
      text: error.message,
    }).toStrictEqual({
      name: 'ConfigurationError',
      text,
    });
  });
});
