import { describe, expect, it } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { StepStatus } from '#/libs/ui';

import {
  renderWithTheme,
  STATUS_LABELS,
  screenReaderOutputOf,
} from '../../../__tests__/ink.fixtures';
import { TaskList } from '../task-list';

/** the first frame of a list whose step `lint` waits and whose step `test` is `status` */
const firstFrameOf = (status: StepStatus): string | undefined =>
  renderWithTheme(
    <TaskList
      statusLabels={STATUS_LABELS}
      steps={[
        {
          label: 'lint',
          status: StepStatus.Pending,
        },
        {
          label: 'test',
          status,
        },
      ]}
    />,
  ).frames[0];

/** what a screen reader says of a list whose one step `lint` is `status` */
const readOutOf = (status: StepStatus): string =>
  screenReaderOutputOf(
    <TaskList
      statusLabels={STATUS_LABELS}
      steps={[
        {
          label: 'lint',
          status,
        },
      ]}
    />,
  );

describe('TaskList', () => {
  it('should draw the settled steps once above the steps still to settle, and read out each step with the label of its status, the settled ones first, as the golden file shows them', async () => {
    // Act
    const golden = goldenOf({
      'a pending step': firstFrameOf(StepStatus.Pending),
      'a running step': firstFrameOf(StepStatus.Running),
      'a done step': firstFrameOf(StepStatus.Done),
      'a failed step': firstFrameOf(StepStatus.Failed),
      'a warned step': firstFrameOf(StepStatus.Warned),
      'a skipped step': firstFrameOf(StepStatus.Skipped),
      'read out, a done step': readOutOf(StepStatus.Done),
      'read out, a running step': readOutOf(StepStatus.Running),
    });

    // Assert
    expect(golden).toBe(await goldenFileText(new URL('task-list.golden.txt', import.meta.url)));
  });
});
