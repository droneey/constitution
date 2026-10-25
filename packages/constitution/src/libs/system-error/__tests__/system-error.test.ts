import { describe, expect, it } from 'bun:test';

import { isSystemError } from '../system-error';

const systemError = Object.assign(new Error('no such file'), {
  code: 'ENOENT',
});
const defect = new TypeError('undefined is not a function');

describe('isSystemError', () => {
  it.each([
    {
      condition: 'the error carries a code',
      error: systemError,
      isSystem: true,
    },
    {
      condition: 'the error carries none',
      error: defect,
      isSystem: false,
    },
    {
      condition: 'the thrown value is no error',
      error: 'ENOENT',
      isSystem: false,
    },
  ])('should say $isSystem when $condition', ({ error, isSystem }) => {
    // Arrange
    const thrown: unknown = error;

    // Act
    const answer = isSystemError(thrown);

    // Assert
    expect(answer).toBe(isSystem);
  });
});
