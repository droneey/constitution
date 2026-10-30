import { describe, expect, it } from 'bun:test';

import { failureOf } from '#/__tests__/failure.fixtures.ts';
import { InvalidValueError } from '#/kernel/errors';

import {
  RepositoryPathFailure,
  RepositoryRelativePath,
} from '../repository-relative-path.model.ts';

describe('RepositoryRelativePath', () => {
  it('should refuse an absolute path with its code', async () => {
    // Act
    const failure = await failureOf({
      call: () => RepositoryRelativePath.create('/work/src/order.ts'),
      kind: InvalidValueError,
    });

    // Assert
    expect(failure?.details).toStrictEqual({
      code: RepositoryPathFailure.NotRelative,
      text: '/work/src/order.ts',
    });
  });
});
