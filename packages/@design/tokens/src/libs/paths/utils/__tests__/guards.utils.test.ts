import { describe, expect, it } from 'bun:test';

import { isMissingPathError } from '../guards.utils';

describe('isMissingPathError', () => {
  it.each([
    {
      condition: 'an error whose code tells that nothing lies at the path',
      error: Object.assign(new Error('missing'), {
        code: 'ENOENT',
      }),
      isMissing: true,
    },
    {
      condition: 'an error whose code tells that a file lies where a folder must',
      error: Object.assign(new Error('not a folder'), {
        code: 'ENOTDIR',
      }),
      isMissing: true,
    },
    {
      condition: 'an error whose code tells another failure',
      error: Object.assign(new Error('too many links'), {
        code: 'ELOOP',
      }),
      isMissing: false,
    },
    {
      condition: 'an error with no code',
      error: new Error('missing'),
      isMissing: false,
    },
    {
      condition: 'a value that is no error, whatever code it holds',
      error: {
        code: 'ENOENT',
      },
      isMissing: false,
    },
  ])('should answer $isMissing for $condition', ({ error, isMissing }) => {
    // Act
    const answer = isMissingPathError(error);

    // Assert
    expect(answer).toBe(isMissing);
  });
});
