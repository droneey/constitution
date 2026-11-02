import type { AbsolutePath } from '#/kernel/value-objects';

import type { AgentInSession } from '../../../../domain/session/entities';
import type { ActiveRulesSource } from '../../../contracts';
import type { SessionRepository } from '../../../contracts/repositories/commands';

interface RecordOwnChangesInput extends AgentInSession {
  readonly paths: readonly AbsolutePath[];
  readonly sessionRepository: SessionRepository;
  readonly source: ActiveRulesSource;
}

const recordOwnChanges = (input: RecordOwnChangesInput): void => {
  if (input.paths.length === 0) {
    return;
  }

  input.sessionRepository.addOwnChanges({
    agent: input.agent,
    paths: input.paths.map(input.source.realPathOf),
    session: input.session,
  });
};

export { recordOwnChanges };
