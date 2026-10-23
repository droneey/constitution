import { describe, expect, it } from 'bun:test';

import { ProjectFailure } from '../../entities';
import { isProjectError, ProjectError } from '../project.error';

describe('ProjectError', () => {
  it('should name its failure, its path and its line when constitution.yaml does not parse', () => {
    // Arrange
    const failure = {
      code: ProjectFailure.ConfigUnparsed,
      line: 3,
      path: '/work/project/constitution.yaml',
    };

    // Act
    const error = new ProjectError(failure);

    // Assert
    expect({
      code: error.code,
      line: error.line,
      message: error.message,
      name: error.name,
      path: error.path,
    }).toStrictEqual({
      code: ProjectFailure.ConfigUnparsed,
      line: 3,
      message: 'config-unparsed: /work/project/constitution.yaml',
      name: 'ProjectError',
      path: '/work/project/constitution.yaml',
    });
  });

  it.each([
    {
      condition: 'it is a ProjectError',
      error: new ProjectError({
        code: ProjectFailure.NoProject,
        path: '/work',
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
