import { describe, expect, it } from 'bun:test';

import { compareFindings, compareText } from '../order.utils';

describe('compareText', () => {
  it.each([
    [
      'a',
      'b',
      -1,
    ],
    [
      'b',
      'a',
      1,
    ],
    [
      'a',
      'a',
      0,
    ],
    [
      'Z',
      'a',
      -1,
    ],
  ])(
    'should order %p before or after %p by code point when compared',
    (left, right, expected) => {
      // Arrange
      const pair = {
        left,
        right,
      };

      // Act
      const order = compareText(pair.left, pair.right);

      // Assert
      expect(order).toBe(expected);
    },
  );
});

describe('compareFindings', () => {
  it('should order findings by path, then by message when the paths are equal', () => {
    // Arrange
    const findings = [
      {
        message: 'b',
        path: 'x.md',
      },
      {
        message: 'z',
        path: 'a.md',
      },
      {
        message: 'a',
        path: 'x.md',
      },
    ];

    // Act
    const sorted = findings.toSorted(compareFindings);

    // Assert
    expect(sorted).toStrictEqual([
      {
        message: 'z',
        path: 'a.md',
      },
      {
        message: 'a',
        path: 'x.md',
      },
      {
        message: 'b',
        path: 'x.md',
      },
    ]);
  });
});
