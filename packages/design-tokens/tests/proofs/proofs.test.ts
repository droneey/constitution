import { describe, expect, it } from 'bun:test';

import { contrastCases, contrastOf, GRID, pixelsOf, sizePaths } from './proofs.fixtures';

describe('the default theme', () => {
  it.each(contrastCases)(
    'should give $foreground on $background at least $minimum:1 in the $mode mode',
    (pair) => {
      // Act
      const contrast = contrastOf(pair);

      // Assert
      expect(contrast).toBeGreaterThanOrEqual(pair.minimum);
    },
  );

  it.each(sizePaths)('should keep %s on the grid', (path) => {
    // Arrange
    const grid = GRID;

    // Act
    const pixels = pixelsOf(path);

    // Assert
    expect(grid).toContain(pixels);
  });
});
