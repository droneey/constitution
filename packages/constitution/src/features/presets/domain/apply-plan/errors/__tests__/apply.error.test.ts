import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { ApplyError, ApplyFailure, isApplyError } from '../apply.error';

describe('ApplyError', () => {
  it('should name its failure and the file it could not write, and keep its cause', () => {
    // Arrange
    const cause = new Error('EACCES: permission denied');
    const failure = {
      code: ApplyFailure.NotWritten,
      details: {
        filePath: AbsolutePath.create('/work/project/biome.json'),
      },
    };

    // Act
    const error = new ApplyError(failure, {
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
      code: ApplyFailure.NotWritten,
      details: {
        filePath: AbsolutePath.create('/work/project/biome.json'),
      },
      name: 'ApplyError',
    });
  });

  it.each([
    {
      condition: 'it is an ApplyError',
      error: new ApplyError({
        code: ApplyFailure.NotWritten,
        details: {
          filePath: AbsolutePath.create('/work/project/biome.json'),
        },
      }),
      isApply: true,
    },
    {
      condition: 'it is another error',
      error: new Error('EACCES: /work/project/biome.json'),
      isApply: false,
    },
  ])('should say $isApply when $condition', ({ error, isApply }) => {
    // Act
    const answer = isApplyError(error);

    // Assert
    expect(answer).toBe(isApply);
  });
});
