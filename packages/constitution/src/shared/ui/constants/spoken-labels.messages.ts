import { StepStatus, Tone } from '@droneey/design-cli';

/** What a screen reader says for a step's status in place of its symbol. */
const STEP_STATUS_LABELS = {
  [StepStatus.Pending]: 'pending',
  [StepStatus.Running]: 'running',
  [StepStatus.Done]: 'done',
  [StepStatus.Failed]: 'failed',
  [StepStatus.Warned]: 'warned',
  [StepStatus.Skipped]: 'skipped',
} as const satisfies Readonly<Record<StepStatus, string>>;

/** What a screen reader says for a note's tone in place of its symbol. */
const TONE_LABELS = {
  [Tone.Accent]: 'accent',
  [Tone.Success]: 'success',
  [Tone.Error]: 'error',
  [Tone.Warning]: 'warning',
  [Tone.Info]: 'info',
  [Tone.Muted]: 'muted',
} as const satisfies Readonly<Record<Tone, string>>;

export { STEP_STATUS_LABELS, TONE_LABELS };
