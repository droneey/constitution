import { describe, expect, it } from 'bun:test';

import { isProgramError } from '../program.error';
import { isProjectError, ProjectError, ProjectFailure } from '../project.error';

describe('ProjectError', () => {
  it('should name its failure, its path, its line and its cause when constitution.yaml does not parse', () => {
    // Arrange
    const cause = new Error('line 3');
    const failure = {
      code: ProjectFailure.ConfigUnparsed,
      details: {
        line: 3,
        path: '/work/project/constitution.yaml',
      },
    };

    // Act
    const error = new ProjectError(failure, {
      cause,
    });

    // Assert
    expect({
      cause: error.cause,
      code: error.code,
      details: error.details,
      isProgramError: isProgramError(error),
      name: error.name,
    }).toStrictEqual({
      cause,
      code: ProjectFailure.ConfigUnparsed,
      details: {
        line: 3,
        path: '/work/project/constitution.yaml',
      },
      isProgramError: true,
      name: 'ProjectError',
    });
  });

  it.each([
    {
      condition: 'it is a ProjectError',
      error: new ProjectError({
        code: ProjectFailure.NoProject,
        details: {
          path: '/work',
        },
      }),
      isProject: true,
    },
    {
      condition: 'it is another error',
      error: new Error('no-project: /work'),
      isProject: false,
    },
  ])('should say $isProject when $condition', ({ error, isProject }) => {
    // Arrange
    const thrown: unknown = error;

    // Act
    const answer = isProjectError(thrown);

    // Assert
    expect(answer).toBe(isProject);
  });
});
