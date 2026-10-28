import { describe, expect, it } from 'bun:test';

import { goldenFileText } from '#/__tests__/golden.fixtures';

import { MalformedTokenError } from '../../errors';
import { outputsOf } from './configs.fixtures';

describe('configOf', () => {
  it("should write each mode's module: the accent's roles as steps, the opaque roles, the accent's scale and the motion and spacing in hex and numbers, as the golden files show them", async () => {
    // Act
    const modules = await outputsOf();

    // Assert
    expect(modules).toStrictEqual([
      {
        'theme/light.gen.ts': await goldenFileText(new URL('light.golden.txt', import.meta.url)),
      },
      {
        'theme/dark.gen.ts': await goldenFileText(new URL('dark.golden.txt', import.meta.url)),
      },
    ]);
  });

  it.each([
    {
      name: 'a measure written as a bare number',
      file: 'bare-measure.fixtures.tokens.json',
      token: 'duration-slow',
    },
    {
      name: 'a measure left empty',
      file: 'absent-measure.fixtures.tokens.json',
      token: 'duration-slow',
    },
    {
      name: 'a measure whose value is text',
      file: 'text-measure.fixtures.tokens.json',
      token: 'duration-slow',
    },
    {
      name: 'a colour written as text',
      file: 'hex-colour.fixtures.tokens.json',
      token: 'color-plain-0',
    },
  ])('should refuse $name', async ({ file, token }) => {
    // Arrange
    const malformed = [
      file,
    ];

    // Act
    const build = outputsOf(malformed);

    // Assert
    await expect(build).rejects.toThrow(new MalformedTokenError(token));
  });
});
