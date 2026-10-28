import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { isTreeError, TreeError, TreeFailure } from '../tree.error';

describe('TreeError', () => {
  it('should name its failure and its folder, and keep its cause, when git does not answer in time', () => {
    // Arrange
    const cause = new Error('spawnSync git ETIMEDOUT');
    const failure = {
      code: TreeFailure.TimedOut,
      details: {
        path: AbsolutePath.create('/work/constitution'),
      },
    };

    // Act
    const error = new TreeError(failure, {
      cause,
    });

    // Assert
    expect({
      cause: error.cause,
      code: error.code,
      details: error.details,
      name: error.name,
    }).toStrictEqual({
      cause,
      code: TreeFailure.TimedOut,
      details: {
        path: AbsolutePath.create('/work/constitution'),
      },
      name: 'TreeError',
    });
  });

  it.each([
    {
      condition: 'it is a TreeError',
      error: new TreeError({
        code: TreeFailure.Failed,
        details: {
          path: AbsolutePath.create('/work'),
        },
      }),
      isTree: true,
    },
    {
      condition: 'it is another error',
      error: new Error('failed: /work'),
      isTree: false,
    },
  ])('should say $isTree when $condition', ({ error, isTree }) => {
    // Act
    const answer = isTreeError(error);

    // Assert
    expect(answer).toBe(isTree);
  });
});
