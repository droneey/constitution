import { describe, expect, it } from 'bun:test';

import { CONTRAST_CASES, contrastOf, GRID, pixelsOf, SIZE_PATHS } from './proofs.fixtures';

describe('the default theme', () => {
  it.each(CONTRAST_CASES)(
    'should give $foreground on $background at least $minimum:1 in the $mode mode',
    (pair) => {
      // Arrange
      const { minimum } = pair;

      // Act
      const contrast = contrastOf(pair);

      // Assert
      expect(contrast).toBeGreaterThanOrEqual(minimum);
    },
  );

  it.each(SIZE_PATHS)('should keep %s on the grid', (path) => {
    // Arrange
    const grid = GRID;

    // Act
    const pixels = pixelsOf(path);

    // Assert
    expect(grid).toContain(pixels);
  });
});
