import { GRID_GROUPS } from '../constants';
import type { DesignTokens } from '../types';
import { pathsUnder, pixelsOf } from './tokens.utils';

const findOffGridTokens = (tokens: DesignTokens, grid: readonly number[]): string[] =>
  pathsUnder(tokens, GRID_GROUPS).flatMap((path) => {
    const pixels = pixelsOf(tokens, path);

    return grid.includes(pixels)
      ? []
      : [
          `${path} is ${pixels}px, off the grid`,
        ];
  });

export { findOffGridTokens };
