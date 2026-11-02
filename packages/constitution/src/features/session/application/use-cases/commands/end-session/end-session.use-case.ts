import type { SessionId } from '../../../../domain/session/value-objects';
import type { GateRepository } from '../../../contracts/repositories/commands';

interface EndSessionInput {
  readonly gateRepository: GateRepository;
  readonly session: SessionId;
}

const endSession = (input: EndSessionInput): void => {
  input.gateRepository.removeSessionFolders(input.session);
};

export { endSession };
