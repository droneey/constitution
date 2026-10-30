enum SessionMark {
  Turn = 'turn',
  Checked = 'checked',
  Blocked = 'blocked',
  Reviewed = 'reviewed',
  Unjudged = 'unjudged',
}

type FingerprintMark = Exclude<SessionMark, SessionMark.Unjudged>;

export type { FingerprintMark };
export { SessionMark };
