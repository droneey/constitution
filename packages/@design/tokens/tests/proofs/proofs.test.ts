import { describe, expect, it } from 'bun:test';

import {
  contrastCases,
  contrastOf,
  GRID_PIXELS,
  isLineOfEvenPixels,
  leadingTokenPaths,
  pixelsOf,
  sizeTokenPaths,
} from './proofs.fixtures';

describe('the default theme', () => {
  it.each(contrastCases)(
    'should give $foreground on $background at least $minimum:1 in the $modeName mode',
    (pair) => {
      // Act
      const contrast = contrastOf(pair);

      // Assert
      expect(contrast).toBeGreaterThanOrEqual(pair.minimum);
    },
  );

  it.each(sizeTokenPaths)('should keep %s on the grid', (tokenPath) => {
    // Arrange
    const gridPixels = GRID_PIXELS;

    // Act
    const pixels = pixelsOf(tokenPath);

    // Assert
    expect(gridPixels).toContain(pixels);
  });

  it.each(leadingTokenPaths)('should give the line of %s whole even pixels', (leadingPath) => {
    // Act
    const isEven = isLineOfEvenPixels(leadingPath);

    // Assert
    expect(isEven).toBe(true);
  });
});
