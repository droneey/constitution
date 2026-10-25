import { describe, expect, it } from 'bun:test';

import { InvalidValueError, ValueFailure } from '../../errors';
import { PackPath } from '../pack-path.value-object';

describe('PackPath', () => {
  it.each([
    {
      condition: 'it names a folder',
      isPackPath: true,
      text: './rules',
    },
    {
      condition: 'it is empty',
      isPackPath: false,
      text: '',
    },
  ])('should tell a pack path when $condition', ({ isPackPath, text }) => {
    // Arrange
    const candidate = text;

    // Act
    const isPath = PackPath.is(candidate);

    // Assert
    expect(isPath).toBe(isPackPath);
  });

  it.each([
    {
      condition: 'it is absent',
      given: undefined,
    },
    {
      condition: 'it is a number',
      given: 42,
    },
  ])('should tell no pack path when $condition', ({ given }) => {
    // Arrange
    const candidate: unknown = given;

    // Act
    const isValue = PackPath.is(candidate);

    // Assert
    expect(isValue).toBe(false);
  });

  it('should refuse an empty path', () => {
    // Arrange
    const text = '';

    // Act
    const create = (): PackPath => PackPath.create(text);

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: ValueFailure.PackPath,
        details: {
          text,
        },
      }),
    );
  });

  it.each([
    {
      condition: 'they are written alike',
      isEqual: true,
      left: 'rules',
      right: 'rules',
    },
    {
      condition: 'one is written with "./" and a trailing slash',
      isEqual: true,
      left: './rules/',
      right: 'rules',
    },
    {
      condition: 'one steps into a folder and back',
      isEqual: true,
      left: 'tools/../rules',
      right: 'rules',
    },
    {
      condition: 'they name two folders',
      isEqual: false,
      left: 'rules',
      right: 'rules/more',
    },
  ])('should say $isEqual when $condition', ({ isEqual, left, right }) => {
    // Arrange
    const packs = [
      PackPath.create(left),
      PackPath.create(right),
    ] as const;

    // Act
    const isSame = PackPath.equals(...packs);

    // Assert
    expect(isSame).toBe(isEqual);
  });

  it.each([
    {
      condition: 'the folder is a member and the pack lies up the tree',
      expected: 'rules',
      folder: 'apps/web',
      pack: '../../rules',
    },
    {
      condition: 'the pack lies in the folder',
      expected: 'apps/web/rules',
      folder: 'apps/web',
      pack: './rules/',
    },
  ])(
    'should give the pack a folder names from the repository when $condition',
    ({ expected, folder, pack }) => {
      // Arrange
      const written = PackPath.create(pack);

      // Act
      const fromRepository = PackPath.fromFolder(written, folder);

      // Assert
      expect<string>(fromRepository).toBe(expected);
    },
  );
});
