import type { SessionState } from '../../../../domain/entities';
import { HookEventName, SessionOrigin } from '../../../../domain/entities';
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
