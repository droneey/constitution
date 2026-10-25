import { describe, expect, it } from 'bun:test';

import { isProgramError } from '../program.error';
import { isWorkingTreeError, WorkingTreeError, WorkingTreeFailure } from '../working-tree.error';

describe('WorkingTreeError', () => {
  it('should name its failure and what git wrote when git fails', () => {
    // Arrange
    const failure = {
      code: WorkingTreeFailure.GitFailed,
      details: {
        stderr: 'fatal: not a git repository\n',
      },
    };

    // Act
    const error = new WorkingTreeError(failure);

    // Assert
    expect({
      code: error.code,
      details: error.details,
      isProgramError: isProgramError(error),
      name: error.name,
    }).toStrictEqual({
      code: WorkingTreeFailure.GitFailed,
      details: {
        stderr: 'fatal: not a git repository\n',
      },
      isProgramError: true,
      name: 'WorkingTreeError',
    });
  });

  it.each([
    {
      condition: 'it is a WorkingTreeError',
      error: new WorkingTreeError({
        code: WorkingTreeFailure.GitFailed,
        details: {
          stderr: '',
        },
      }),
      isWorkingTree: true,
    },
    {
      condition: 'it is another error',
      error: new Error('git-failed'),
      isWorkingTree: false,
    },
  ])('should say $isWorkingTree when $condition', ({ error, isWorkingTree }) => {
    // Arrange
    const thrown: unknown = error;

    // Act
    const answer = isWorkingTreeError(thrown);

    // Assert
    expect(answer).toBe(isWorkingTree);
  });
});
