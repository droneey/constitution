/**
 * What a session records between its hooks: the fingerprints of the tree when the user last
 * prompted, when the check last passed, when the gate last blocked and when the reviewer last
 * reviewed, and why git last could not report the tree.
 */
enum SessionMark {
  Turn = 'turn',
  Checked = 'checked',
  Blocked = 'blocked',
  Reviewed = 'reviewed',
  Unjudged = 'unjudged',
}

/** A mark that records the fingerprint of the tree. */
type FingerprintMark = Exclude<SessionMark, SessionMark.Unjudged>;

export type { FingerprintMark };
export { SessionMark };
