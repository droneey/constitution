import { describe, expect, it } from 'bun:test';

import { firstBy } from '../first-by.utils';

describe('firstBy', () => {
  it("should keep each key's first entry, in the order the keys first appear, when a key repeats", () => {
    // Arrange
    const firstB = {
      key: 'b',
      order: 1,
    };
    const firstA = {
      key: 'a',
      order: 2,
    };
    const entries = [
      firstB,
      firstA,
      {
        key: 'b',
        order: 3,
      },
    ];

    // Act
    const firsts = firstBy(entries, (entry) => entry.key);

    // Assert
    expect([
      ...firsts,
    ]).toStrictEqual([
      [
        'b',
        firstB,
      ],
      [
        'a',
        firstA,
      ],
    ]);
  });
});
