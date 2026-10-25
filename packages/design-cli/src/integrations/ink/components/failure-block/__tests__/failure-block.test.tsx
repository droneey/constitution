import { describe, expect, it } from 'bun:test';

import { renderWithTheme } from '../../../__tests__/ink.fixtures';
import { FailureBlock } from '../failure-block';

describe('FailureBlock', () => {
  it('should draw what happened, what is known and what to do next', () => {
    // Arrange
    const failure = {
      details: [
        'no constitution.yaml',
      ],
      hint: 'run constitution init',
      title: 'No project here',
    };

    // Act
    const { lastFrame } = renderWithTheme(<FailureBlock failure={failure} />);

    // Assert
    expect(lastFrame()).toBe(
      '✗ No project here\n  no constitution.yaml\n  → run constitution init',
    );
  });

  it('should leave the next step out when the failure names none', () => {
    // Arrange
    const failure = {
      details: [],
      title: 'Interrupted',
    };

    // Act
    const { lastFrame } = renderWithTheme(<FailureBlock failure={failure} />);

    // Assert
    expect(lastFrame()).toBe('✗ Interrupted');
  });
});
