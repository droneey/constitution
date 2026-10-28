import { describe, expect, it } from 'bun:test';

import { render } from 'ink-testing-library';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { createPlainTheme } from '#/__tests__/theme.fixtures';
import { StepStatus } from '#/libs/ui';

import { frameOf, STATUS_LABELS, screenReaderOutputOf } from '../../../__tests__/ink.fixtures';
import { Step } from '../step';

const settled = {
  label: 'lint',
  status: StepStatus.Done,
};

const running = {
  label: 'test',
  status: StepStatus.Running,
};

const moving = createPlainTheme({
  isMotionReduced: false,
});

describe('Step', () => {
  it('should draw the symbol, the label and the detail of a step, a spinner only while it runs and the theme moves, and read out its status and whether it is busy, as the golden file shows them', async () => {
    // Act
    const golden = goldenOf({
      'a settled step with a detail': frameOf(
        <Step
          statusLabel={STATUS_LABELS[StepStatus.Done]}
          step={{
            ...settled,
            detail: '3 files',
            label: 'format',
          }}
        />,
      ),
      'a running step while the theme moves': frameOf(
        <Step
          statusLabel={STATUS_LABELS[running.status]}
          step={running}
        />,
        moving,
      ),
      'a running step while the theme holds still': frameOf(
        <Step
          statusLabel={STATUS_LABELS[running.status]}
          step={running}
        />,
      ),
      'a settled step while the theme moves': frameOf(
        <Step
          statusLabel={STATUS_LABELS[settled.status]}
          step={settled}
        />,
        moving,
      ),
      'a running step with no theme': render(
        <Step
          statusLabel={STATUS_LABELS[running.status]}
          step={running}
        />,
      ).lastFrame(),
      'read out, a settled step': screenReaderOutputOf(
        <Step
          statusLabel={STATUS_LABELS[settled.status]}
          step={settled}
        />,
      ),
      'read out, a running step': screenReaderOutputOf(
        <Step
          statusLabel={STATUS_LABELS[running.status]}
          step={running}
        />,
      ),
    });

    // Assert
    expect(golden).toBe(await goldenFileText(new URL('step.golden.txt', import.meta.url)));
  });
});
