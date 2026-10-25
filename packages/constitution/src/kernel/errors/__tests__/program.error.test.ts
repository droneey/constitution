import { describe, expect, it } from 'bun:test';

import { InvalidValueError, ValueFailure } from '../invalid-value.error';
import { isProgramError, ProgramError } from '../program.error';

describe('isProgramError', () => {
  it.each([
    {
      condition: 'the program declares the error',
      error: new InvalidValueError({
        code: ValueFailure.BlockId,
        details: {
          text: 'Bad',
        },
      }),
      isDeclared: true,
    },
    {
      condition: 'the runtime threw it',
      error: new TypeError('x is undefined'),
      isDeclared: false,
    },
    {
      condition: 'it is no error',
      error: 'id-not-kebab-case',
      isDeclared: false,
    },
  ])('should say $isDeclared when $condition', ({ error, isDeclared }) => {
    // Act
    const answer = isProgramError(error);

    // Assert
    expect(answer).toBe(isDeclared);
  });
});

describe('ProgramError', () => {
  it('should word its message as its code, a colon and the JSON of its details when it is made', () => {
    // Arrange
    const input = {
      code: 'id-not-kebab-case',
      details: {
        text: 'Bad',
      },
    };

    // Act
    const error = new ProgramError(input);

    // Assert
    expect(error.message).toBe('id-not-kebab-case: {"text":"Bad"}');
  });
});
