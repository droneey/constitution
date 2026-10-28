import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, render, screen } from '@testing-library/react';

import { createBrandFile } from '#/__tests__/brand.fixtures';
import { AccentScale } from '#/libs/ui';

import { componentViolationsIn } from '../../../__tests__/axe.fixtures';
import { removeStylesheets, rootPropertyOf } from '../../../__tests__/styles.fixtures';
import { ThemeProvider } from '../theme-provider';

const goldAccent = AccentScale.create(createBrandFile());

afterEach(() => {
  cleanup();
  removeStylesheets();
});

describe('ThemeProvider', () => {
  it("should put each step of the app's accent scale in place of the default's on the root", () => {
    // Arrange
    const tree = (
      <ThemeProvider accent={goldAccent}>
        <p>Rules</p>
      </ThemeProvider>
    );

    // Act
    render(tree);

    // Assert
    expect({
      '--color-brand-300': rootPropertyOf('--color-brand-300'),
      '--color-brand-600': rootPropertyOf('--color-brand-600'),
    }).toStrictEqual({
      '--color-brand-300': 'oklch(0.82 0.11 85)',
      '--color-brand-600': 'oklch(0.5 0.17 85)',
    });
  });

  it('should draw what it holds', () => {
    // Arrange
    const tree = (
      <ThemeProvider>
        <p>Rules</p>
      </ThemeProvider>
    );

    // Act
    render(tree);

    // Assert
    expect(screen.getByRole('paragraph').textContent).toBe('Rules');
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

  // React keeps one stylesheet of a name for the document, so only the first case of the file
  // that gives an accent sees it drawn: this one gives none.
  it('should break no rule of WCAG A and AA around what it holds', async () => {
    // Arrange
    render(
      <ThemeProvider>
        <p>Rules</p>
      </ThemeProvider>,
    );

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
