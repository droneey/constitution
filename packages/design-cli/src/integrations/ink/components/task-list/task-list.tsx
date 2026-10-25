import type { ReactElement } from 'react';

import { Box, Static } from 'ink';

import type { StepContent } from '#/libs/ui';
import { StepStatus } from '#/libs/ui';

import { Step } from '../step';
import type { TaskListProps } from './task-list.types';

const isSettled = (step: StepContent): boolean =>
  step.status !== StepStatus.Pending && step.status !== StepStatus.Running;

/** the steps of a run, one a line: the settled ones written once above, the rest redrawn */
function TaskList({ steps }: TaskListProps): ReactElement {
  return (
    <Box
      aria-role='list'
      flexDirection='column'
    >
      <Static items={steps.filter(isSettled)}>
        {(step): ReactElement => (
          <Step
            key={step.label}
            step={step}
          />
        )}
      </Static>
      {steps
        .filter((step) => !isSettled(step))
        .map((step) => (
          <Step
            key={step.label}
            step={step}
          />
        ))}
    </Box>
  );
}

export { TaskList };
