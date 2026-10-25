import { describe, expect, it } from 'bun:test';

import { BlockId, UnitPath } from '#/kernel/value-objects';

import { heirsText, whereText } from '../wording.utils';

describe('heirsText', () => {
  it.each([
    {
      condition: 'the block has no heir',
      expected: 'one of its heirs',
      heirs: [],
    },
    {
      condition: 'the block has one heir',
      expected: 'owned-data',
      heirs: [
        'owned-data',
      ],
    },
    {
      condition: 'the block has two heirs',
      expected: 'owned-data or messaging',
      heirs: [
        'owned-data',
        'messaging',
      ],
    },
    {
      condition: 'the block has three heirs',
      expected: 'owned-data, messaging or edge-cache',
      heirs: [
        'owned-data',
        'messaging',
        'edge-cache',
      ],
    },
  ])('should offer the heirs as "$expected" when $condition', ({ expected, heirs }) => {
    // Arrange
    const ids = heirs.map((heir) => BlockId.create(heir));

    // Act
    const text = heirsText(ids);

    // Assert
    expect(text).toBe(expected);
  });
});

describe('whereText', () => {
  it.each([
    {
      condition: 'the unit is the repository',
      expected: '',
      unit: '',
    },
    {
      condition: 'the unit is a member',
      expected: ' in apps/web',
      unit: 'apps/web',
    },
  ])('should name where a warning holds as "$expected" when $condition', ({ expected, unit }) => {
    // Arrange
    const path = UnitPath.create(unit);

    // Act
    const text = whereText(path);

    // Assert
    expect(text).toBe(expected);
  });
});
