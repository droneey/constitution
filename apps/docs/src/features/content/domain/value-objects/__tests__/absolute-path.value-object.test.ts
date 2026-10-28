import { describe, expect, it } from 'bun:test';

import { ValueFailure } from '../../errors';
import { AbsolutePath } from '../absolute-path.value-object';
import { failureOf } from './value-object.fixtures';

describe('AbsolutePath.create', () => {
  it('should keep a path from the root of the file system', () => {
    // Act
    const path = AbsolutePath.create('/repository/README.md');

    // Assert
    expect<string>(path).toBe('/repository/README.md');
  });

  it('should refuse a path from the working folder', () => {
    // Arrange
    const text = 'docs/guides/upgrade.md';

    // Act
    const failure = failureOf(() => AbsolutePath.create(text));

    // Assert
    expect(failure).toStrictEqual({
      code: ValueFailure.PathNotAbsolute,
      details: {
        value: text,
      },
    });
  });
});

describe('AbsolutePath.is', () => {
  it.each([
    {
      candidate: '/repository',
      condition: 'a path from the root',
      expected: true,
    },
    {
      candidate: 'repository',
      condition: 'a path from the working folder',
      expected: false,
    },
    {
      candidate: 1,
      condition: 'no text',
      expected: false,
    },
  ])('should answer $expected when the candidate is $condition', ({ candidate, expected }) => {
    // Act
    const isAbsolute = AbsolutePath.is(candidate);

    // Assert
    expect(isAbsolute).toBe(expected);
  });
});
