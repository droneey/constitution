import { describe, expect, it } from 'bun:test';

import { InvalidValueError, ValueFailure } from '../invalid-value.error';
import { isProgramError } from '../program.error';

describe('InvalidValueError', () => {
  it('should name its failure and the text it refused when a value object refuses a text', () => {
    // Arrange
    const refused = {
      code: ValueFailure.RuleSlug,
      details: {
        text: 'Bad_Slug',
      },
    };

    // Act
    const error = new InvalidValueError(refused);

    // Assert
    expect({
      code: error.code,
      details: error.details,
      isProgramError: isProgramError(error),
      name: error.name,
    }).toStrictEqual({
      code: ValueFailure.RuleSlug,
      details: {
        text: 'Bad_Slug',
      },
      isProgramError: true,
      name: 'InvalidValueError',
    });
  });
});
