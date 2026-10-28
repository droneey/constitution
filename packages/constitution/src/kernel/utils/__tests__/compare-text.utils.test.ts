import { describe, expect, it } from 'bun:test';

import { compareText } from '../compare-text.utils';

describe('compareText', () => {
  it.each([
    {
      expected: -1,
      left: 'Z',
      name: 'an upper-case letter meets a lower-case one, which code points order first',
      right: 'a',
    },
    {
      expected: 1,
      left: 'b',
      name: 'the left text sorts after the right one',
      right: 'a',
    },
    {
      expected: 0,
      left: 'a',
      name: 'the texts are equal',
      right: 'a',
    },
  ])('should return $expected when $name', ({ expected, left, right }) => {
    // Arrange
    const pair = {
      left,
      right,
    };

    // Act
    const order = compareText(pair.left, pair.right);

    // Assert
    expect(order).toBe(expected);
  });
});
