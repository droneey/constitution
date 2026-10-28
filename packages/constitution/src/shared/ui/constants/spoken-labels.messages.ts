import { StepStatus, Tone } from '@droneey/design-cli';

const STEP_STATUS_LABELS = {
  [StepStatus.Pending]: 'pending',
  [StepStatus.Running]: 'running',
  [StepStatus.Done]: 'done',
  [StepStatus.Failed]: 'failed',
  [StepStatus.Warned]: 'warned',
  [StepStatus.Skipped]: 'skipped',
} as const satisfies Readonly<Record<StepStatus, string>>;

const TONE_LABELS = {
  [Tone.Accent]: 'accent',
  [Tone.Success]: 'success',
  [Tone.Error]: 'error',
  [Tone.Warning]: 'warning',
  [Tone.Info]: 'info',
  [Tone.Muted]: 'muted',
} as const satisfies Readonly<Record<Tone, string>>;

export { STEP_STATUS_LABELS, TONE_LABELS };
