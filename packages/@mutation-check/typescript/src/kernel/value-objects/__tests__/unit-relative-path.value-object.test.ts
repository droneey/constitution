import { describe, expect, it } from 'bun:test';

import { failureOf } from '#/__tests__/failure.fixtures.ts';

import { InvalidValueError, ValueFailure } from '../../errors';
import { UnitRelativePath } from '../unit-relative-path.value-object.ts';

describe('UnitRelativePath', () => {
  it('should tell no text from a path inside the unit', () => {
    // Act
    const isFound = UnitRelativePath.is(7);

    // Assert
    expect(isFound).toBe(false);
  });

  it('should refuse a path outside the unit with its code', async () => {
    // Act
    const failure = await failureOf({
      call: () => UnitRelativePath.create('../src/order.ts'),
      kind: InvalidValueError,
    });

    // Assert
    expect(failure?.details).toStrictEqual({
      code: ValueFailure.UnitRelativePath,
      text: '../src/order.ts',
    });
  });
});
