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
});

describe('isPresetFileRefusal', () => {
  it.each([
    {
      condition: 'the error is a refusal',
      error: new PresetFileRefusal({
        offset: 7,
      }),
      isRefusal: true,
    },
    {
      condition: 'the error is a defect',
      error: new TypeError('a defect'),
      isRefusal: false,
    },
  ])('should say $isRefusal when $condition', ({ error, isRefusal }) => {
    // Act
    const answer = isPresetFileRefusal(error);

    // Assert
    expect(answer).toBe(isRefusal);
  });
});
