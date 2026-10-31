import { describe, expect, it } from 'bun:test';

import { InvalidValueError } from '#/kernel/errors';

import { SessionValueFailure } from '../../errors';
import { RefusalKey } from '../refusal-key.value-object';

describe('RefusalKey', () => {
  it.each([
    {
      given: '0123456789abcdef',
      isValue: true,
    },
    {
      given: '0123456789ABCDEF',
      isValue: false,
    },
  ])('should say $isValue of $given', ({ given, isValue }) => {
    // Act
    const answer = RefusalKey.is(given);

    // Assert
    expect(answer).toBe(isValue);
  });

  it('should refuse a text of another form', () => {
    // Act
    const create = (): RefusalKey => RefusalKey.create('0123456789ABCDEF');

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: SessionValueFailure.RefusalKey,
        details: {
          text: '0123456789ABCDEF',
        },
      }),
    );
  });
});
