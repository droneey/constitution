import { describe, expect, it } from 'bun:test';

import { renderWithTheme } from '../../../__tests__/ink.fixtures';
import { FailureBlock } from '../failure-block';

describe('FailureBlock', () => {
  it('should draw what happened, what is known and what to do next', () => {
    // Arrange
    const failure = {
      details: [
        'constitution.yaml',
      ],
      hint: 'init',
      title: 'no-project',
    };

    // Act
    const { lastFrame } = renderWithTheme(<FailureBlock failure={failure} />);

    // Assert
    expect(lastFrame()).toBe('✗ no-project\n  constitution.yaml\n  → init');
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
