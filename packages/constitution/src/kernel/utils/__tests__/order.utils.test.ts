import { describe, expect, it } from 'bun:test';

import { compareFindings, compareText } from '../order.utils';

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

describe('compareFindings', () => {
  it('should order findings by path, then by code, then by message when the paths and codes are equal', () => {
    // Arrange
    const findings = [
      {
        code: 'b-code',
        message: 'a',
        path: 'x.md',
      },
      {
        code: 'a-code',
        message: 'z',
        path: 'x.md',
      },
      {
        code: 'z-code',
        message: 'z',
        path: 'a.md',
      },
      {
        code: 'a-code',
        message: 'y',
        path: 'x.md',
      },
    ];

    // Act
    const sorted = findings.toSorted(compareFindings);

    // Assert
    expect(sorted).toStrictEqual([
      {
        code: 'z-code',
        message: 'z',
        path: 'a.md',
      },
      {
        code: 'a-code',
        message: 'y',
        path: 'x.md',
      },
      {
        code: 'a-code',
        message: 'z',
        path: 'x.md',
      },
      {
        code: 'b-code',
        message: 'a',
        path: 'x.md',
      },
    ]);
  });
});
