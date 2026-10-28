import type { ReactElement } from 'react';

import { Box, Static } from 'ink';

import type { StepContent } from '#/libs/ui';
import { StepStatus } from '#/libs/ui';

import { Step } from '../step';

interface TaskListProps {
  /** what a screen reader says for each status a step may have, in the run's language */
  readonly statusLabels: Readonly<Record<StepStatus, string>>;
  /** the steps of a run, each named by its own label; a settled step never changes again */
  readonly steps: readonly StepContent[];
}

const IS_SETTLED: Readonly<Record<StepStatus, boolean>> = {
  [StepStatus.Pending]: false,
  [StepStatus.Running]: false,
  [StepStatus.Done]: true,
  [StepStatus.Failed]: true,
  [StepStatus.Warned]: true,
  [StepStatus.Skipped]: true,
} as const;

const isSettled = (step: StepContent): boolean => IS_SETTLED[step.status];

/** the steps of a run, one a line: the settled ones written once above, the rest redrawn */
function TaskList({ statusLabels, steps }: TaskListProps): ReactElement {
  return (
    <Box
      aria-role='list'
      flexDirection='column'
    >
      <Static items={steps.filter(isSettled)}>
        {(step): ReactElement => (
          <Step
            key={step.label}
            statusLabel={statusLabels[step.status]}
            step={step}
          />
        )}
      </Static>
      {steps
        .filter((step) => !isSettled(step))
        .map((step) => (
          <Step
            key={step.label}
            statusLabel={statusLabels[step.status]}
            step={step}
          />
        ))}
    </Box>
  );
}

export type { TaskListProps };
export { TaskList };
