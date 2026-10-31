import type { AbsolutePath } from '#/kernel/value-objects';

import type { ActiveRulesSource } from '../../../contracts';
import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import type { AgentInSession } from '../../../entities';

interface RecordOwnChangesInput extends AgentInSession {
  readonly paths: readonly AbsolutePath[];
  readonly sessions: SessionCommandRepository;
  readonly source: ActiveRulesSource;
}

const recordOwnChanges = (input: RecordOwnChangesInput): void => {
  if (input.paths.length === 0) {
    return;
  }

  input.sessions.addOwnChanges({
    agent: input.agent,
    paths: input.paths.map(input.source.realPathOf),
    session: input.session,
  });
};

export { recordOwnChanges };
