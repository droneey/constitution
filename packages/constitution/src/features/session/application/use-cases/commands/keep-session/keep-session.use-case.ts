import type { HookEventName, SessionOrigin, SessionState } from '../../../../domain/entities';
import { SessionStart } from '../../../../domain/entities';
import type { SessionId } from '../../../../domain/value-objects';
import type { SessionCommandRepository } from '../../../contracts/repositories/commands';

interface KeepSessionInput {
  readonly event: HookEventName;
  readonly origin: SessionOrigin;
  readonly session: SessionId;
  readonly sessions: SessionCommandRepository;
  readonly state: SessionState | undefined;
}

const keepSession = (input: KeepSessionInput): void => {
  if (input.state === undefined || !SessionStart.keepsState(input.event)) {
    return;
  }

  input.sessions.saveState({
    isReminderKept: SessionStart.keepsReminders(input.origin),
    session: input.session,
    state: input.state,
  });
};

export { keepSession };
