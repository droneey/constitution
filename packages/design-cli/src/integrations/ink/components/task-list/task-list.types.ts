import type { StepContent } from '#/libs/ui';

interface TaskListProps {
  /** the steps of a run, each named by its own label; a settled step never changes again */
  readonly steps: readonly StepContent[];
}

export type { TaskListProps };
