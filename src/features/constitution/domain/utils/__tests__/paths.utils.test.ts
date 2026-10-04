import { describe, expect, it } from 'bun:test';

import { normalizePath } from '../paths.utils';

describe('paths', () => {
  it.each([
    {
      condition: 'a segment is "."',
      expected: 'blocks/core',
      path: 'blocks/./core',
    },
    {
      condition: 'a segment is empty',
      expected: 'blocks/core',
      path: 'blocks//core',
    },
    {
      condition: 'a ".." takes back the segment before it',
      expected: 'blocks/domains',
      path: 'blocks/core/../domains',
    },
    {
      condition: 'a ".." has nothing to take back',
      expected: '../blocks',
      path: '../blocks',
    },
    {
      condition: 'a ".." follows another',
      expected: '../../blocks',
      path: '../../blocks',
    },
    {
      condition: 'the path starts at the repository root',
      expected: 'blocks/core',
      path: '/blocks/core',
    },
    {
      condition: 'the path is a folder',
      expected: 'blocks/core/',
      path: 'blocks/core/',
    },
    {
      condition: 'nothing is left of a folder',
      expected: '.',
      path: './',
    },
  ])('should normalise the path when $condition', ({ expected, path }) => {
    // Arrange
    const input = path;

    // Act
    const normalised = normalizePath(input);

    // Assert
    expect(normalised).toBe(expected);
  });
});
