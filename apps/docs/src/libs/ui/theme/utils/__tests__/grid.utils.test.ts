import { describe, expect, it } from 'bun:test';

import { ThemeTokenError } from '../../errors';
import { findOffGridTokens } from '../grid.utils';
import { createTokens } from './theme.fixtures';

describe('findOffGridTokens', () => {
  it('should refuse nothing when every size is on the grid', () => {
    // Arrange
    const tokens = createTokens();

    // Act
    const failures = findOffGridTokens(
      tokens,
      [
        8,
        16,
      ],
    );

    // Assert
    expect(failures).toStrictEqual([]);
  });

  it('should refuse each size off the grid, through the references that lead to it, and no other group', () => {
    // Arrange
    const tokens = createTokens({
      dimension: {
        '6': {
          $value: {
            unit: 'px',
            value: 6,
          },
        },
        '8': {
          $value: {
            unit: 'px',
            value: 8,
          },
        },
      },
      spacing: {
        xs: {
          $value: '{size.icon}',
        },
      },
      size: {
        icon: {
          $value: '{dimension.6}',
        },
      },
      text: {
        sm: {
          $value: '{dimension.6}',
        },
      },
      leading: {
        sm: {
          $value: '{dimension.6}',
        },
      },
      radius: {
        '3': {
          $value: {
            unit: 'px',
            value: 3,
          },
        },
      },
    });

    // Act
    const failures = findOffGridTokens(
      tokens,
      [
        8,
      ],
    );

    // Assert
    expect(failures).toStrictEqual([
      'dimension.6 is 6px, off the grid',
      'spacing.xs is 6px, off the grid',
      'size.icon is 6px, off the grid',
      'text.sm is 6px, off the grid',
      'leading.sm is 6px, off the grid',
    ]);
  });

  it('should refuse the tokens when a size refers to no token', () => {
    // Arrange
    const tokens = createTokens({
      spacing: {
        sm: {
          $value: '{dimension.12}',
        },
      },
    });

    // Act
    const act = (): string[] =>
      findOffGridTokens(
        tokens,
        [
          8,
        ],
      );

    // Assert
    expect(act).toThrow(new ThemeTokenError('no token dimension.12'));
  });
});
