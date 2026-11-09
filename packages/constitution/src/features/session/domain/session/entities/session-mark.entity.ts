enum SessionMark {
  Turn = 'turn',
  Checked = 'checked',
  Reviewed = 'reviewed',
  Unjudged = 'unjudged',
  Started = 'started',
}

type FingerprintMark = Exclude<SessionMark, SessionMark.Started | SessionMark.Unjudged>;

export type { FingerprintMark };
export { SessionMark };
