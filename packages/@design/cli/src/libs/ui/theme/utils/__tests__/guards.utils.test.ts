import { describe, expect, it } from 'bun:test';

import { isRecord } from '../guards.utils';

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
    // Act
    const answer = isRecord(raw);

    // Assert
    expect(answer).toBe(isOne);
  });
});
