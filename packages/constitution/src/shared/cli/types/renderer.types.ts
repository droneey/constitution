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
  readonly print: (report: Report) => Promise<void>;
  readonly run: <TResult>(task: Task<TResult>) => Promise<TResult>;
}

interface StepReport {
  readonly isFailed: boolean;
  readonly outcome: TaskOutcome;
  readonly sections: readonly Section[];
}

export type { Renderer, StepReport, Task, TaskOutcome };
