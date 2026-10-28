import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup } from 'ink-testing-library';

import { createPlainTheme } from '#/__tests__/theme.fixtures';

import { frameOnceShown, renderWithTheme } from '../../../__tests__/ink.fixtures';
import { Spinner } from '../spinner';

/** slower than Ink's own pace, so a spinner that kept Ink's would move too soon */
const PACE_MS = 300;

/** the least wait the pace allows, since Ink's clock starts while it draws, a moment before the wait */
const LEAST_WAIT_MS = 250;

const pacedTheme = {
  ...createPlainTheme({
    isMotionReduced: false,
  }),
  spinner: {
    frames: [
      'a',
      'b',
    ],
    intervalMs: PACE_MS,
  },
};

describe('Spinner', () => {
  afterEach(cleanup);

  it("should move to its next frame once the theme's pace has passed", async () => {
    // Arrange
    const { lastFrame } = renderWithTheme(<Spinner label='Reading' />, pacedTheme);

    // Act
    const shown = await frameOnceShown(lastFrame, 'b Reading…');

    // Assert
    expect(shown.frame).toBe('b Reading…');
    expect(shown.shownAfterMs).toBeGreaterThanOrEqual(LEAST_WAIT_MS);
  });
});
