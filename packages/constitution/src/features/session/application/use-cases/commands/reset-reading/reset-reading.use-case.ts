import { SessionAgent } from '../../../../domain/session/entities';
import type { SessionId } from '../../../../domain/session/value-objects';
import { SessionOrigin } from '../../../../domain/session-start/entities';
import { HookEventName } from '../../../../domain/shared/entities';
import type { GateRepository } from '../../../contracts/repositories/commands';

interface ResetReadingInput {
  readonly event: HookEventName;
  readonly gateRepository: GateRepository;
  readonly origin: SessionOrigin;
  readonly session: SessionId;
}

const forgettingOrigins = new Set([
  SessionOrigin.Clear,
  SessionOrigin.Compact,
]);

const resetReading = (input: ResetReadingInput): void => {
  if (input.event !== HookEventName.SessionStart || !forgettingOrigins.has(input.origin)) {
    return;
  }

  input.gateRepository.resetReading({
    agent: SessionAgent.main,
    session: input.session,
  });
};

export { resetReading };
