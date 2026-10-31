import type { SessionState } from '../../../../domain/session/entities';
import type { SessionId } from '../../../../domain/session/value-objects';
import type { SessionOrigin } from '../../../../domain/session-start/entities';
import { SessionStart } from '../../../../domain/session-start/entities';
import type { HookEventName } from '../../../../domain/shared/entities';
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
