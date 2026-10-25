import { describe, expect, it } from 'bun:test';

import { InvalidValueError } from '../invalid-value.error';

describe('InvalidValueError', () => {
  it('should keep the field and the value, and name both in its message', () => {
    // Act
    const error = new InvalidValueError({
      field: 'axis',
      value: 'delivery',
    });

    // Assert
    expect({
      field: error.field,
      message: error.message,
      value: error.value,
    }).toStrictEqual({
      field: 'axis',
      message: expect.stringMatching(/^(?=.*axis)(?=.*delivery)/),
      value: 'delivery',
    });
  });
});
