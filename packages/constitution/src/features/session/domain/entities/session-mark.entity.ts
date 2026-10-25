/**
 * The fingerprints of the tree a session records: when the user last prompted, when the check
 * last passed, when the gate last blocked and when the reviewer last reviewed.
 */
enum SessionMark {
  Turn = 'turn',
  Checked = 'checked',
  Blocked = 'blocked',
  Reviewed = 'reviewed',
}

export { SessionMark };
