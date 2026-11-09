import type { SessionState } from '../../../../domain/session/entities';
import type { SessionId } from '../../../../domain/session/value-objects';
import type { SessionOrigin } from '../../../../domain/session-start/entities';
import { SessionStart } from '../../../../domain/session-start/entities';
import type { HookEventName } from '../../../../domain/shared/entities';
import type { SessionRepository } from '../../../contracts/repositories/commands';

interface KeepSessionInput {
  readonly event: HookEventName;
  readonly origin: SessionOrigin;
  readonly session: SessionId;
  readonly sessionRepository: SessionRepository;
  readonly state: SessionState | undefined;
}

const keepSession = (input: KeepSessionInput): void => {
  if (!SessionStart.keepsState(input.event)) {
    return;
  }

  // Why: a start whose digest keeps no state, as one of a project with no release, is still
  // recorded, so a prompt does not start the session again and repeat what it said.
  if (input.state === undefined) {
    input.sessionRepository.recordStarted(input.session);

    return;
  }

  input.sessionRepository.saveState({
    isReminderKept: SessionStart.keepsReminders(input.origin),
    session: input.session,
    state: input.state,
  });
};

export { keepSession };
