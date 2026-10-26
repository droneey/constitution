import { describe, expect, it } from 'bun:test';

import { StepStatus } from '#/libs/ui';

import { renderWithTheme, screenReaderOutputOf } from '../../../__tests__/ink.fixtures';
import { TaskList } from '../task-list';

describe('TaskList', () => {
  it('should draw the settled steps once above the steps still to settle', () => {
    // Arrange
    const steps = [
      {
        label: 'test',
        status: StepStatus.Pending,
      },
      {
        label: 'lint',
        status: StepStatus.Failed,
      },
    ];

    // Act
    const { frames } = renderWithTheme(<TaskList steps={steps} />);

    // Assert
    expect(frames[0]).toBe('✗ lint\n• test');
  });

  it('should read out a list of its steps', () => {
    // Arrange
    const steps = [
      {
        label: 'lint',
        status: StepStatus.Running,
      },
    ];

    // Act
    const spoken = screenReaderOutputOf(<TaskList steps={steps} />);

    // Assert
    expect(spoken).toBe('list: listitem: (busy) running lint');
  });
});
