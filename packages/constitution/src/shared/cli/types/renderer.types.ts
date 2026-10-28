import type { StepStatus } from '@droneey/design-cli';

import type { Report, Section } from './report.types';

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

/** What one step of a command found, as its report shows it. */
interface StepReport {
  readonly isFailed: boolean;
  readonly outcome: TaskOutcome;
  readonly sections: readonly Section[];
}

export type { Renderer, StepReport, Task, TaskOutcome };
