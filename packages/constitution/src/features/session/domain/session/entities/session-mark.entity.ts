enum SessionMark {
  Turn = 'turn',
  Checked = 'checked',
  Reviewed = 'reviewed',
  Unjudged = 'unjudged',
}

type FingerprintMark = Exclude<SessionMark, SessionMark.Unjudged>;

export type { FingerprintMark };
export { SessionMark };
