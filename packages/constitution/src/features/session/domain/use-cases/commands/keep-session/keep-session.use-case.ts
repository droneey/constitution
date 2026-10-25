import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import type { SessionState } from '../../../entities';
import { HookEventName, SessionOrigin } from '../../../entities';
import type { SessionId } from '../../../value-objects';

/**
 * Keeps the state a session starts with for its later hooks: a resumed session keeps what it was
 * reminded of, any other starts afresh. A subagent's start, and a start that gave no state, keep
 * nothing.
 */
const keepSession = (input: {
  event: HookEventName;
  origin: SessionOrigin;
  session: SessionId;
  sessions: SessionCommandRepository;
  state: SessionState | undefined;
}): void => {
  if (input.state === undefined || input.event !== HookEventName.SessionStart) {
    return;
  }

  input.sessions.saveState({
    isReminderKept: input.origin === SessionOrigin.Resume,
    session: input.session,
    state: input.state,
  });
};

export { keepSession };
