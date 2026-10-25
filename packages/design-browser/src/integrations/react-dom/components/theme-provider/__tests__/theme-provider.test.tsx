import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, render, screen } from '@testing-library/react';

import { removeStylesheets, rootPropertyOf } from '../../../__tests__/styles.fixtures';
import { ThemeProvider } from '../theme-provider';

const GOLD_ACCENT = {
  color: {
    brand: {
      $type: 'color',
      '300': {
        $value: {
          colorSpace: 'oklch',
          components: [
            0.82,
            0.11,
            85,
          ],
          hex: '#e5bf6d',
        },
      },
      '600': {
        $value: {
          colorSpace: 'oklch',
          components: [
            0.5,
            0.17,
            85,
          ],
        },
      },
      '700': {
        $value: {
          colorSpace: 'oklch',
          components: [
            0.42,
            0.086,
          ],
        },
      },
    },
  },
} as const;

afterEach(() => {
  cleanup();
  removeStylesheets();
});

describe('ThemeProvider', () => {
  it("should put each step of the app's accent scale in place of the default's on the root", () => {
    // Arrange
    const tree = (
      <ThemeProvider accent={GOLD_ACCENT}>
        <p>Rules</p>
      </ThemeProvider>
    );

    // Act
    render(tree);

    // Assert
    expect(screen.getByText('Rules').textContent).toBe('Rules');
    expect(rootPropertyOf('--color-brand-600')).toBe('oklch(0.5 0.17 85)');
    expect(rootPropertyOf('--color-brand-300')).toBe('oklch(0.82 0.11 85)');
    expect(rootPropertyOf('--color-brand-700')).toBe('');
  });

  it('should leave the default accent in place when the app gives none', () => {
    // Arrange
    const tree = (
      <ThemeProvider>
        <p>Rules</p>
      </ThemeProvider>
    );

    // Act
    render(tree);

    // Assert
    expect(rootPropertyOf('--color-brand-600')).toBe('');
  });
});
