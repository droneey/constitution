import { describe, expect, it } from 'bun:test';

import { InvalidValueError, ValueFailure } from '../../errors';
import { AbsolutePath } from '../absolute-path.value-object';

describe('AbsolutePath', () => {
  it.each([
    {
      condition: 'it opens with a slash',
      given: '/work/project',
      isAbsolute: true,
    },
    {
      condition: 'it is relative',
      given: 'work/project',
      isAbsolute: false,
    },
    {
      condition: 'it is no text',
      given: 42,
      isAbsolute: false,
    },
  ])('should say $isAbsolute when $condition', ({ given, isAbsolute }) => {
    // Act
    const answer = AbsolutePath.is(given);

    // Assert
    expect(answer).toBe(isAbsolute);
  });

  it('should refuse a relative path', () => {
    // Arrange
    const text = 'work/project';

    // Act
    const create = (): AbsolutePath => AbsolutePath.create(text);

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: ValueFailure.AbsolutePath,
        details: {
          text,
        },
      }),
    );
  });

  it.each([
    {
      condition: 'the relative path names a file below the folder',
      expected: '/work/project/apps/web',
      folder: '/work/project',
      relativePath: 'apps/web',
    },
    {
      condition: 'the relative path is empty',
      expected: '/work/project',
      folder: '/work/project',
      relativePath: '',
    },
    {
      condition: 'the folder is the root',
      expected: '/work',
      folder: '/',
      relativePath: 'work',
    },
  ])(
    'should join a folder and a relative path when $condition',
    ({ expected, folder, relativePath }) => {
      // Arrange
      const folderPath = AbsolutePath.create(folder);

      // Act
      const joined = AbsolutePath.join(folderPath, relativePath);

      // Assert
      expect<string>(joined).toBe(expected);
    },
  );

  it.each([
    {
      condition: 'the folder lies below the root',
      expected: [
        '/work/project',
        '/work',
        '/',
      ],
      folder: '/work/project',
    },
    {
      condition: 'the folder is the root',
      expected: [
        '/',
      ],
      folder: '/',
    },
  ])('should give the folder and each folder above it when $condition', ({ expected, folder }) => {
    // Arrange
    const folderPath = AbsolutePath.create(folder);

    // Act
    const folders = AbsolutePath.upwardFrom(folderPath);

    // Assert
    expect<readonly string[]>(folders).toStrictEqual(expected);
  });
});
