import type { GateCommandRepository } from '../../../contracts/repositories/commands';
import { HookEventName, SessionAgent, SessionOrigin } from '../../../entities';
import type { SessionId } from '../../../value-objects';

interface ResetReadingInput {
  readonly event: HookEventName;
  readonly gates: GateCommandRepository;
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

  input.gates.resetReading({
    agent: SessionAgent.main,
    session: input.session,
  });
};

export { resetReading };
