import { describe, expect, it } from 'bun:test';

import { accentStylesheetOf } from '../accent.utils';

describe('accentStylesheetOf', () => {
  it('should write each step of the scale that holds a colour of three components, and nothing for the rest', () => {
    // Arrange
    const accent = {
      color: {
        brand: {
          $type: 'color',
          // a step a brand file leaves empty, as JSON can
          '50': JSON.parse('null'),
          '100': {
            $value: {
              colorSpace: 'oklch',
              components: [
                0.94,
                0.043,
              ],
            },
          },
          '200': {
            $value: {
              colorSpace: 'oklch',
              components: [
                0.88,
                '0.077',
                85,
              ],
            },
          },
          '300': {
            $value: {
              colorSpace: 'oklch',
              components: [
                0.82,
                0.11,
                85,
              ],
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
        },
      },
    };

    // Act
    const stylesheet = accentStylesheetOf(accent);

    // Assert
    expect(stylesheet).toBe(
      ':root { --color-brand-300: oklch(0.82 0.11 85); --color-brand-600: oklch(0.5 0.17 85); }',
    );
  });
});
