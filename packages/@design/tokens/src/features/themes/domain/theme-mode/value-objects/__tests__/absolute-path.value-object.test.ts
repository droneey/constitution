import { describe, expect, it } from 'bun:test';

import { RelativePathError } from '../../errors';
import { AbsolutePath } from '../absolute-path.value-object';

describe('AbsolutePath.create', () => {
  it('should take the text when it is an absolute path', () => {
    // Arrange
    const text = '/design/tokens/color.tokens.json';

    // Act
    const created = AbsolutePath.create(text);

    // Assert
    expect<string>(created).toBe(text);
  });

  it('should refuse the text when it is a relative path', () => {
    // Arrange
    const text = 'tokens/color.tokens.json';

    // Act
    const creating = (): unknown => AbsolutePath.create(text);

    // Assert
    expect(creating).toThrow(new RelativePathError(text));
  });
});

describe('AbsolutePath.is', () => {
  it.each([
    {
      condition: 'an absolute path',
      candidate: '/design/tokens',
      isAbsolutePath: true,
    },
    {
      condition: 'a relative path',
      candidate: 'design/tokens',
      isAbsolutePath: false,
    },
    {
      condition: 'no text',
      candidate: 42,
      isAbsolutePath: false,
    },
  ])('should answer $isAbsolutePath when given $condition', ({ candidate, isAbsolutePath }) => {
    // Act
    const answer = AbsolutePath.is(candidate);

    // Assert
    expect(answer).toBe(isAbsolutePath);
  });
});
