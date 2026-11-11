enum SessionMark {
  Turn = 'turn',
  Checked = 'checked',
  CheckStarted = 'check-started',
  Reviewed = 'reviewed',
  ReviewStarted = 'review-started',
  Unjudged = 'unjudged',
  Started = 'started',
}

type FingerprintMark = Exclude<SessionMark, SessionMark.Started | SessionMark.Unjudged>;

interface CheckRun {
  readonly isInBackground: boolean;
}

// Why: Claude Code calls the hook as a background command starts, before the check has passed,
// and tells no hook when it ends, so such a run records only its start.
const checkMarkOf = (input: CheckRun): FingerprintMark =>
  input.isInBackground ? SessionMark.CheckStarted : SessionMark.Checked;

export type { FingerprintMark };
export { checkMarkOf, SessionMark };
