import type { StepStatus } from '@droneey/design-cli';

import type { Report } from './report.types';

interface TaskOutcome {
  readonly detail?: string;
  readonly status: StepStatus;
}

interface Task<TResult> {
  readonly label: string;
  readonly outcomeOf: (returned: TResult) => TaskOutcome;
  readonly run: () => Promise<TResult> | TResult;
}

interface Renderer {
  /** writes the command's result to standard output, its progress ended first */
  readonly print: (report: Report) => Promise<void>;
  /** runs a step, its progress on standard error */
  readonly run: <TResult>(task: Task<TResult>) => Promise<TResult>;
}

export type { Renderer, Task, TaskOutcome };
