import type { SessionState } from './project.entity';

// The digest a session starts with: the lines before the rules, and the rules.
interface Digest {
  readonly body: readonly string[];
  readonly head: readonly string[];
}

// What a session's start reports: the event, the session, where it started, and how.
interface SessionStart {
  // the event's name, SessionStart when it gives none
  readonly event: string;
  readonly origin: string;
  readonly session: string;
  // the folder the project is looked for from
  readonly start: string;
}

interface SessionDigest {
  readonly digest: Digest;
  readonly event: string;
  // the state the session keeps for its later hooks, when it is a session that keeps one
  readonly save?: {
    readonly isReminderKept: boolean;
    readonly session: string;
    readonly state: SessionState;
  };
}

interface Reminder {
  // the blocks named, which the session's reminded list takes
  readonly ids: readonly string[];
  readonly notes: readonly string[];
}

enum StopVerdict {
  // the reviewer finished: the tree it reviewed is recorded
  Reviewed = 'reviewed',
  // the tree changed since the check last passed: the agent runs it before it hands back
  Blocked = 'blocked',
  // the changed files fall under active blocks the reviewer has not reviewed them against
  Review = 'review',
}

type StopJudgement =
  | {
      readonly check: string;
      readonly fingerprint: string;
      readonly verdict: StopVerdict.Blocked;
    }
  | {
      readonly fingerprint: string;
      readonly verdict: StopVerdict.Reviewed;
    }
  | {
      // the blocks the changed files fall under, in their order
      readonly blocks: readonly string[];
      readonly verdict: StopVerdict.Review;
    };

interface StopEvent {
  readonly agentName: string;
  readonly agentType: string;
  readonly event: string;
  readonly isHookActive: string;
  readonly session: string;
}

export type { Digest, Reminder, SessionDigest, SessionStart, StopEvent, StopJudgement };
export { StopVerdict };
