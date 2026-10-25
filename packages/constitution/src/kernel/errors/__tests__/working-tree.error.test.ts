import { describe, expect, it } from 'bun:test';

import { isProgramError } from '../program.error';
import { WorkingTreeError, WorkingTreeFailure } from '../working-tree.error';

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
});
