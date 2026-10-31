import { describe, expect, it } from 'bun:test';

import { InvalidValueError } from '#/kernel/errors';

import { SessionValueFailure } from '../../errors';
import { FileSignature } from '../file-signature.value-object';

describe('FileSignature', () => {
  it.each([
    {
      condition: 'it is one line',
      given: '10:1',
      isSignature: true,
    },
    {
      condition: 'it is empty',
      given: '',
      isSignature: false,
    },
    {
      condition: 'it ends with a line feed',
      given: '10:1\n',
      isSignature: false,
    },
    {
      condition: 'it starts with a carriage return',
      given: '\r10:1',
      isSignature: false,
    },
  ])('should say $isSignature when $condition', ({ given, isSignature }) => {
    // Act
    const answer = FileSignature.is(given);

    // Assert
    expect(answer).toBe(isSignature);
  });

  it('should refuse a text that breaks a line', () => {
    // Act
    const create = (): FileSignature => FileSignature.create('10\n1');

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: SessionValueFailure.FileSignature,
        details: {
          text: '10\n1',
        },
      }),
    );
  });
});
