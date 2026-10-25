import { describe, expect, it } from 'bun:test';

import { InvalidValueError, ValueFailure } from '../../errors';
import { Version } from '../version.value-object';

describe('Version', () => {
  it.each([
    {
      condition: 'it names a major, a minor and a patch',
      isRelease: true,
      text: '1.2.3',
    },
    {
      condition: 'its numbers run to several digits',
      isRelease: true,
      text: '10.20.300',
    },
    {
      condition: 'it names a pre-release',
      isRelease: true,
      text: '2.0.0-rc.1',
    },
    {
      condition: 'it is empty',
      isRelease: false,
      text: '',
    },
    {
      condition: 'it misses its patch',
      isRelease: false,
      text: '1.2',
    },
    {
      condition: 'it names a fourth number',
      isRelease: false,
      text: '1.2.3.4',
    },
    {
      condition: 'it opens with the v of a tag',
      isRelease: false,
      text: 'v1.2.3',
    },
    {
      condition: 'it is a word',
      isRelease: false,
      text: 'next',
    },
    {
      condition: 'its pre-release is empty',
      isRelease: false,
      text: '1.2.3-',
    },
    {
      condition: 'a space trails it',
      isRelease: false,
      text: '1.2.3 ',
    },
  ])('should tell a release version when $condition', ({ isRelease, text }) => {
    // Act
    const isVersion = Version.is(text);

    // Assert
    expect(isVersion).toBe(isRelease);
  });

  it.each([
    {
      condition: 'it is absent',
      given: undefined,
    },
    {
      condition: 'it is a number',
      given: 1,
    },
    {
      condition: 'it is a list whose text is a version',
      given: [
        '1.2.3',
      ],
    },
  ])('should tell no version when $condition', ({ given }) => {
    // Act
    const isVersion = Version.is(given);

    // Assert
    expect(isVersion).toBe(false);
  });

  it('should make the version a release version text names', () => {
    // Arrange
    const text = '0.81.0-preview';

    // Act
    const version = Version.create(text);

    // Assert
    expect<string>(version).toBe(text);
  });

  it('should refuse a text that is no release version', () => {
    // Arrange
    const text = 'latest';

    // Act
    const create = (): Version => Version.create(text);

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: ValueFailure.Version,
        details: {
          text,
        },
      }),
    );
  });

  it.each([
    {
      condition: 'they are one version',
      isEqual: true,
      left: '1.2.3',
      right: '1.2.3',
    },
    {
      condition: 'one is a pre-release of the other',
      isEqual: false,
      left: '1.2.3-rc.1',
      right: '1.2.3',
    },
  ])('should say $isEqual when $condition', ({ isEqual, left, right }) => {
    // Arrange
    const versions = [
      Version.create(left),
      Version.create(right),
    ] as const;

    // Act
    const isSame = Version.equals(...versions);

    // Assert
    expect(isSame).toBe(isEqual);
  });

  it.each([
    {
      condition: 'they are one release',
      left: '1.2.3',
      order: 0,
      right: '1.2.3',
    },
    {
      condition: 'the left is older by its patch',
      left: '1.2.3',
      order: -1,
      right: '1.2.4',
    },
    {
      condition: 'the left is newer by its patch',
      left: '1.2.10',
      order: 1,
      right: '1.2.9',
    },
    {
      condition: 'the left is newer by its minor, its patch lower',
      left: '1.3.0',
      order: 1,
      right: '1.2.9',
    },
    {
      condition: 'the left is older by its major, its minor higher',
      left: '1.9.0',
      order: -1,
      right: '2.0.0',
    },
    {
      condition: 'a pre-release is read as its release',
      left: '1.2.3-rc.1',
      order: 0,
      right: '1.2.3',
    },
    {
      condition: 'a pre-release is of an older release',
      left: '1.2.3-rc.1',
      order: -1,
      right: '1.2.4',
    },
  ])('should order $left before, after or as $right when $condition', ({ left, order, right }) => {
    // Arrange
    const versions = [
      Version.create(left),
      Version.create(right),
    ] as const;

    // Act
    const compared = Version.compare(...versions);

    // Assert
    expect(Math.sign(compared)).toBe(order);
  });
});
