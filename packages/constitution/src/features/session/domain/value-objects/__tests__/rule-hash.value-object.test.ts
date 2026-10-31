import { describe, expect, it } from 'bun:test';

import { InvalidValueError } from '#/kernel/errors';

import { SessionValueFailure } from '../../errors';
import { RuleHash } from '../rule-hash.value-object';

describe('RuleHash', () => {
  it.each([
    {
      given: '0123456789abcdef',
      isValue: true,
    },
    {
      given: '0123456789abcde',
      isValue: false,
    },
    {
      given: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      isValue: true,
    },
    {
      given: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
      isValue: false,
    },
    {
      given: '0123456789ABCDEF',
      isValue: false,
    },
    {
      given: '',
      isValue: false,
    },
    {
      given: 'x0123456789abcdef',
      isValue: false,
    },
    {
      given: '0123456789abcdefx',
      isValue: false,
    },
    {
      given: 7,
      isValue: false,
    },
    {
      given: 1_234_567_890_123_456,
      isValue: false,
    },
  ])('should say $isValue of $given', ({ given, isValue }) => {
    // Act
    const answer = RuleHash.is(given);

    // Assert
    expect(answer).toBe(isValue);
  });

  it('should make the value its text gives', () => {
    // Act
    const hash = RuleHash.create('0123456789abcdef');

    // Assert
    expect<string>(hash).toBe('0123456789abcdef');
  });

  it('should refuse a text of another form', () => {
    // Act
    const create = (): RuleHash => RuleHash.create('0123456789ABCDEF');

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: SessionValueFailure.RuleHash,
        details: {
          text: '0123456789ABCDEF',
        },
      }),
    );
  });
});
