import { describe, expect, it } from 'bun:test';

import { renderWithTheme, screenReaderOutputOf } from '../../../__tests__/ink.fixtures';
import { ProgressBar } from '../progress-bar';

describe('ProgressBar', () => {
  it('should draw the bar of the share, the count and the percentage', () => {
    // Arrange
    const progress = {
      done: 1,
      label: 'Files',
      total: 4,
    };

    // Act
    const { lastFrame } = renderWithTheme(<ProgressBar progress={progress} />);

    // Assert
    expect(lastFrame()).toBe('Files █████░░░░░░░░░░░░░░░ 1/4 (25%)');
  });

  it('should read out the count without the bar', () => {
    // Arrange
    const progress = {
      done: 1,
      label: 'Files',
      total: 4,
    };

    // Act
    const spoken = screenReaderOutputOf(<ProgressBar progress={progress} />);

    // Assert
    expect(spoken).toBe('progressbar: Files 1/4 (25%)');
  });
});
