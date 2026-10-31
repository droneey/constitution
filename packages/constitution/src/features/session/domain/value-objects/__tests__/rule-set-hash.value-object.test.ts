import { describe, expect, it } from 'bun:test';

import { InvalidValueError } from '#/kernel/errors';

import { SessionValueFailure } from '../../errors';
import { RuleSetHash } from '../rule-set-hash.value-object';

describe('RuleSetHash', () => {
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
    const answer = RuleSetHash.is(given);

    // Assert
    expect(answer).toBe(isValue);
  });

  it('should refuse a text of another form', () => {
    // Act
    const create = (): RuleSetHash => RuleSetHash.create('0123456789ABCDEF');

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: SessionValueFailure.RuleSetHash,
        details: {
          text: '0123456789ABCDEF',
        },
      }),
    );
  });
});
