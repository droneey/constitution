import { describe, expect, it } from 'bun:test';

import { GitError, GitFailure } from '../git.error.ts';

describe('GitError', () => {
  it.each([
    {
      condition: 'git could not run',
      details: {
        args: [
          'merge-base',
          'HEAD',
        ],
        folder: '/work',
      },
      text: 'git merge-base HEAD failed in /work',
    },
    {
      condition: 'git gave its reason',
      details: {
        args: [
          'diff',
        ],
        folder: '/work',
        stderr: 'fatal: no main line',
      },
      text: 'git diff failed in /work: fatal: no main line',
    },
  ])('should read as its command and its reason when $condition', ({ details, text }) => {
    // Arrange
    const input = {
      code: GitFailure.Failed,
      details,
    };

    // Act
    const error = new GitError(input);

    // Assert
    expect({
      name: error.name,
      text: error.message,
    }).toStrictEqual({
      name: 'GitError',
      text,
    });
  });
});
