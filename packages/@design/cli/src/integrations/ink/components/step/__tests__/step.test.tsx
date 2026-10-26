import { describe, expect, it } from 'bun:test';

import { render } from 'ink-testing-library';

import { StepStatus } from '#/libs/ui';

import {
  createPlainOutput,
  renderWithTheme,
  screenReaderOutputOf,
} from '../../../__tests__/ink.fixtures';
import { Step } from '../step';

describe('Step', () => {
  it('should draw the symbol, the label and the detail of a settled step', () => {
    // Arrange
    const step = {
      detail: '3 files',
      label: 'format',
      status: StepStatus.Done,
    };

    // Act
    const { lastFrame } = renderWithTheme(<Step step={step} />);

    // Assert
    expect(lastFrame()).toBe('✓ format — 3 files');
  });

  it("should draw the spinner's first frame while a step runs and the theme moves", () => {
    // Arrange
    const step = {
      label: 'test',
      status: StepStatus.Running,
    };

    // Act
    const { lastFrame, unmount } = renderWithTheme(
      <Step step={step} />,
      createPlainOutput({
        isMotionReduced: false,
      }),
    );

    // Assert
    expect(lastFrame()).toBe('⠋ test');
    unmount();
  });

  it("should draw the step's symbol while a step runs and the theme holds still", () => {
    // Arrange
    const step = {
      label: 'test',
      status: StepStatus.Running,
    };

    // Act
    const { lastFrame } = renderWithTheme(<Step step={step} />);

    // Assert
    expect(lastFrame()).toBe('▸ test');
  });

  it("should keep a settled step's symbol while the theme moves", () => {
    // Arrange
    const step = {
      label: 'lint',
      status: StepStatus.Done,
    };

    // Act
    const { lastFrame } = renderWithTheme(
      <Step step={step} />,
      createPlainOutput({
        isMotionReduced: false,
      }),
    );

    // Assert
    expect(lastFrame()).toBe('✓ lint');
  });

  it('should draw plain and still when no provider gives it a theme', () => {
    // Arrange
    const step = {
      label: 'test',
      status: StepStatus.Running,
    };

    // Act
    const { lastFrame } = render(<Step step={step} />);

    // Assert
    expect(lastFrame()).toBe('▸ test');
  });

  it('should read out a settled step as done, not busy', () => {
    // Arrange
    const step = {
      label: 'lint',
      status: StepStatus.Done,
    };

    // Act
    const spoken = screenReaderOutputOf(<Step step={step} />);

    // Assert
    expect(spoken).toBe('listitem: done lint');
  });

  it('should read out the status of a running step and that it is busy', () => {
    // Arrange
    const step = {
      label: 'test',
      status: StepStatus.Running,
    };

    // Act
    const spoken = screenReaderOutputOf(<Step step={step} />);

    // Assert
    expect(spoken).toBe('listitem: (busy) running test');
  });
});
