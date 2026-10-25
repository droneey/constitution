import { describe, expect, it } from 'bun:test';

import { isProgramError } from '#/kernel/errors';

import { BuildError, BuildFailure, isBuildError } from '../build.error';

describe('BuildError', () => {
  it('should name its failure and what it was given when the target is unknown', () => {
    // Arrange
    const failure = {
      code: BuildFailure.TargetUnknown,
      details: {
        given: 'bun-plan9-x64',
      },
    };

    // Act
    const error = new BuildError(failure);

    // Assert
    expect({
      code: error.code,
      details: error.details,
      isProgramError: isProgramError(error),
      name: error.name,
    }).toStrictEqual({
      code: BuildFailure.TargetUnknown,
      details: {
        given: 'bun-plan9-x64',
      },
      isProgramError: true,
      name: 'BuildError',
    });
  });

  it.each([
    {
      condition: 'it is a BuildError',
      error: new BuildError({
        code: BuildFailure.PluginUnreadable,
        details: {
          given: '/work/packages/constitution',
        },
      }),
      isBuild: true,
    },
    {
      condition: 'it is another error',
      error: new Error('plugin-unreadable'),
      isBuild: false,
    },
  ])('should say $isBuild when $condition', ({ error, isBuild }) => {
    // Arrange
    const thrown: unknown = error;

    // Act
    const answer = isBuildError(thrown);

    // Assert
    expect(answer).toBe(isBuild);
  });
});
