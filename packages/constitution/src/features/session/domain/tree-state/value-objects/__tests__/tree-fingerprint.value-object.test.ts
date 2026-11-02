import { describe, expect, it } from 'bun:test';

import { InvalidValueError } from '#/kernel/errors';

import { SessionValueFailure } from '../../../shared/errors';
import { TreeFingerprint } from '../tree-fingerprint.value-object';

describe('TreeFingerprint', () => {
  it.each([
    {
      condition: 'it is one line',
      given: 'a3f09c',
      isFingerprint: true,
    },
    {
      condition: 'it is empty',
      given: '',
      isFingerprint: false,
    },
    {
      condition: 'it ends with a line feed',
      given: 'a3f09c\n',
      isFingerprint: false,
    },
    {
      condition: 'it starts with a carriage return',
      given: '\ra3f09c',
      isFingerprint: false,
    },
    {
      condition: 'it is no text',
      given: 7,
      isFingerprint: false,
    },
  ])('should say $isFingerprint when $condition', ({ given, isFingerprint }) => {
    // Act
    const answer = TreeFingerprint.is(given);

    // Assert
    expect(answer).toBe(isFingerprint);
  });

  it('should make the fingerprint a line gives', () => {
    // Arrange
    const text = 'a3f09c';

    // Act
    const fingerprint = TreeFingerprint.create(text);

    // Assert
    expect<string>(fingerprint).toBe(text);
  });

  it('should refuse a text that breaks a line', () => {
    // Arrange
    const text = 'a3f\n09c';

    // Act
    const create = (): TreeFingerprint => TreeFingerprint.create(text);

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: SessionValueFailure.TreeFingerprint,
        details: {
          text,
        },
      }),
    );
  });
});
