import { describe, expect, it } from 'bun:test';

import {
  createPlainOutput,
  frameOnceShown,
  renderWithTheme,
  screenReaderOutputOf,
} from '../../../__tests__/ink.fixtures';
import { Spinner } from '../spinner';

describe('Spinner', () => {
  it("should draw the step's symbol and the work going on when the theme holds still", () => {
    // Arrange
    const tree = <Spinner label='lint' />;

    // Act
    const { lastFrame } = renderWithTheme(tree);

    // Assert
    expect(lastFrame()).toBe('▸ lint…');
  });

  it('should read out the work going on without the spinner', () => {
    // Arrange
    const tree = <Spinner label='lint' />;

    // Act
    const spoken = screenReaderOutputOf(tree);

    // Assert
    expect(spoken).toBe('timer: (busy) lint…');
  });
});

describe('the spinner', () => {
  it('should move to its next frame at the pace of the theme while the theme moves', async () => {
    // Arrange
    const { lastFrame, unmount } = renderWithTheme(
      <Spinner label='Reading' />,
      createPlainOutput({
        isMotionReduced: false,
      }),
    );

    // Act
    const moved = await frameOnceShown(lastFrame, '⠙ Reading…');

    // Assert
    expect(moved).toBe('⠙ Reading…');
    unmount();
  });
});
