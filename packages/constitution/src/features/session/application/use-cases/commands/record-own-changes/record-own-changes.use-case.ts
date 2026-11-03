import type { AbsolutePath } from '#/kernel/value-objects';

import type { AgentInSession } from '../../../../domain/session/entities';
import type { ActiveRulesSource, WorkingTree } from '../../../contracts';
import type { SessionRepository } from '../../../contracts/repositories/commands';
import { unignoredFilesAmong } from '../shared/unignored-files';

interface RecordOwnChangesInput extends AgentInSession {
  readonly paths: readonly AbsolutePath[];
  readonly sessionRepository: SessionRepository;
  readonly source: ActiveRulesSource;
  readonly workingTree: WorkingTree;
}

const recordOwnChanges = (input: RecordOwnChangesInput): void => {
  const paths = unignoredFilesAmong({
    paths: input.paths.map(input.source.realPathOf),
    source: input.source,
    workingTree: input.workingTree,
  });

  if (paths.length === 0) {
    return;
  }

  input.sessionRepository.addOwnChanges({
    agent: input.agent,
    paths,
    session: input.session,
  });
};

export { recordOwnChanges };
