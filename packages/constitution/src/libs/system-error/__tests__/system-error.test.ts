import { describe, expect, it } from 'bun:test';

import { isSystemError } from '../system-error';

const systemError = Object.assign(new Error('no such file'), {
  code: 'ENOENT',
  syscall: 'open',
});
const programError = Object.assign(new Error('no project'), {
  code: 'no-project',
});
const defect = new TypeError('undefined is not a function');

describe('isSystemError', () => {
  it.each([
    {
      condition: 'the error carries a code and the call that failed',
      error: systemError,
      isSystem: true,
    },
    {
      condition: 'the error carries a code but no call, as an error of the program does',
      error: programError,
      isSystem: false,
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
    // Act
    const answer = isSystemError(error);

    // Assert
    expect(answer).toBe(isSystem);
  });
});
