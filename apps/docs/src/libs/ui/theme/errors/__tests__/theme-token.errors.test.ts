import { describe, expect, it } from 'bun:test';

import { ThemeTokenError } from '../theme-token.errors';

describe('ThemeTokenError', () => {
  it('should show its own name before the message when it is written out', () => {
    // Arrange
    const refusal = 'no token color.neutral.500';

    // Act
    const error = new ThemeTokenError(refusal);

    // Assert
    expect(String(error)).toBe('ThemeTokenError: no token color.neutral.500');
  });
});
