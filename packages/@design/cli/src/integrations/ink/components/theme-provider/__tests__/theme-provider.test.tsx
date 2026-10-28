import { describe, expect, it } from 'bun:test';

import { createPlainOutput, frameOf } from '../../../__tests__/ink.fixtures';
import { Spinner } from '../../spinner';
import { ThemeProvider } from '../theme-provider';

describe('ThemeProvider', () => {
  it('should give its tree the theme of the output it is given', () => {
    // Arrange
    const output = createPlainOutput({
      isMotionReduced: false,
    });

    // Act
    const frame = frameOf(
      <ThemeProvider output={output}>
        <Spinner label='lint' />
      </ThemeProvider>,
    );

    // Assert
    expect(frame).toBe('⠋ lint…');
  });
});
