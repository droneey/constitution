import { mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { ConfigurationError, ConfigurationFailure } from '../configuration.error.ts';
import { strykerConfigurationIn } from '../configuration.ts';

let folder = '';

beforeEach(() => {
  folder = realpathSync(mkdtempSync(join(tmpdir(), 'mutation-check-configuration-')));
});

afterEach(() => {
  rmSync(folder, {
    force: true,
    recursive: true,
  });
});

// What a caller can tell of a failure of the configuration: its code and the files it names.
const failureOf = async (read: () => Promise<unknown>): Promise<unknown> => {
  try {
    await read();
  } catch (error) {
    if (error instanceof ConfigurationError) {
      return {
        code: error.code,
        details: error.details,
      };
    }

    throw error;
  }

  return undefined;
};

describe('strykerConfigurationIn', () => {
  it.each([
    {
      file: 'stryker.config.mjs',
      text: "export default { mutate: ['src/**/*.ts', '!src/**/__tests__/**'] };\n",
    },
    {
      file: 'stryker.config.js',
      text: "export default { mutate: ['src/**/*.ts', '!src/**/__tests__/**'] };\n",
    },
    {
      file: 'stryker.config.json',
      text: '{ "mutate": ["src/**/*.ts", "!src/**/__tests__/**"] }\n',
    },
  ])('should read the patterns to mutate when the folder holds $file', async ({ file, text }) => {
    // Arrange
    writeFileSync(join(folder, file), text);

    // Act
    const configuration = await strykerConfigurationIn(folder);

    // Assert
    expect(configuration).toStrictEqual({
      mutate: [
        'src/**/*.ts',
        '!src/**/__tests__/**',
      ],
    });
  });

  it.each([
    {
      condition: 'names no patterns',
      text: 'export default {};\n',
    },
    {
      condition: 'names a pattern that is not text',
      text: "export default { mutate: ['src/**/*.ts', 1] };\n",
    },
    {
      condition: 'exports nothing by default',
      text: 'export const mutate = [];\n',
    },
    {
      condition: 'exports no object by default',
      text: 'export default null;\n',
    },
  ])('should stop the start when the configuration $condition', async ({ text }) => {
    // Arrange
    writeFileSync(join(folder, 'stryker.config.mjs'), text);

    // Act
    const failure = await failureOf(() => strykerConfigurationIn(folder));

    // Assert
    expect(failure).toStrictEqual({
      code: ConfigurationFailure.MutateMalformed,
      details: {
        files: [
          'stryker.config.mjs',
        ],
      },
    });
  });

  it('should stop the start when the folder holds no configuration', async () => {
    // Act
    const failure = await failureOf(() => strykerConfigurationIn(folder));

    // Assert
    expect(failure).toStrictEqual({
      code: ConfigurationFailure.Missing,
      details: {
        files: [
          'stryker.config.mjs',
          'stryker.config.js',
          'stryker.config.json',
        ],
      },
    });
  });
});
