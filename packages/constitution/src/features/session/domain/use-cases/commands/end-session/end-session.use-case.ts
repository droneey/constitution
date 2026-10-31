import type { GateCommandRepository } from '../../../contracts/repositories/commands';
import type { SessionId } from '../../../value-objects';

interface EndSessionInput {
  readonly gates: GateCommandRepository;
  readonly session: SessionId;
}

const endSession = (input: EndSessionInput): void => {
  input.gates.removeSessionFolders(input.session);
};

export { endSession };
