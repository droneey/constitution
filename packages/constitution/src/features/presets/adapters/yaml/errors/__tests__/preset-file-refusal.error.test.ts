import { describe, expect, it } from 'bun:test';

import { isPresetFileRefusal, PresetFileRefusal } from '../preset-file-refusal.error';

describe('PresetFileRefusal', () => {
  it('should name itself and keep where the refused node starts', () => {
    // Act
    const error = new PresetFileRefusal({
      offset: 12,
    });

    // Assert
    expect({
      details: error.details,
      name: error.name,
    }).toStrictEqual({
      details: {
        offset: 12,
      },
      name: 'PresetFileRefusal',
    });
  });

  it.each([
    {
      condition: 'it is a PresetFileRefusal',
      error: new PresetFileRefusal({
        offset: 0,
      }),
      isRefusal: true,
    },
    {
      condition: 'it is another error',
      error: new Error('an alias'),
      isRefusal: false,
    },
  ])('should say $isRefusal when $condition', ({ error, isRefusal }) => {
    // Act
    const answer = isPresetFileRefusal(error);

    // Assert
    expect(answer).toBe(isRefusal);
  });
});
