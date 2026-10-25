import { describe, expect, it } from 'bun:test';

import { isOklch, isRecord } from '../guards.utils';

describe('isRecord', () => {
  it.each([
    {
      raw: {},
      isOne: true,
    },
    {
      raw: [],
      isOne: false,
    },
    {
      // a value a token file leaves empty, as JSON can
      raw: JSON.parse('null'),
      isOne: false,
    },
    {
      raw: 'color',
      isOne: false,
    },
  ])('should tell whether $raw is a record: $isOne', ({ isOne, raw }) => {
    // Arrange
    const value: unknown = raw;

    // Act
    const answer = isRecord(value);

    // Assert
    expect(answer).toBe(isOne);
  });
});

describe('isOklch', () => {
  it.each([
    {
      raw: [
        0.5,
        0.17,
        85,
      ],
      isOne: true,
    },
    {
      raw: [
        0.5,
        0.17,
      ],
      isOne: false,
    },
    {
      raw: [
        0.5,
        0.17,
        85,
        1,
      ],
      isOne: false,
    },
    {
      raw: [
        0.5,
        '0.17',
        85,
      ],
      isOne: false,
    },
    {
      raw: 'red',
      isOne: false,
    },
  ])('should tell whether $raw is a colour in OKLCH: $isOne', ({ isOne, raw }) => {
    // Arrange
    const value: unknown = raw;

    // Act
    const answer = isOklch(value);

    // Assert
    expect(answer).toBe(isOne);
  });
});
