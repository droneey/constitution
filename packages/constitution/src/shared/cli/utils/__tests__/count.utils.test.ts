import { describe, expect, it } from 'bun:test';

import { countOf } from '../count.utils';

describe('countOf', () => {
  it.each([
    {
      count: 0,
      counted: '0 findings',
    },
    {
      count: 1,
      counted: '1 finding',
    },
    {
      count: 2,
      counted: '2 findings',
    },
  ])('should give $counted when the count is $count', ({ count, counted }) => {
    // Arrange
    const asked = {
      count,
      noun: 'finding',
    };

    // Act
    const given = countOf(asked);

    // Assert
    expect(given).toBe(counted);
  });
});
