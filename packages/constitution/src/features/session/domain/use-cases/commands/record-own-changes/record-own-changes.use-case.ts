import type { AbsolutePath } from '#/kernel/value-objects';

import type { ActiveRulesSource, WorkingTree } from '../../../contracts';
import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import type { AgentInSession } from '../../../entities';
import { unignoredFilesAmong } from '../shared/unignored-files';

interface RecordOwnChangesInput extends AgentInSession {
  readonly paths: readonly AbsolutePath[];
  readonly sessions: SessionCommandRepository;
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

  input.sessions.addOwnChanges({
    agent: input.agent,
    paths,
    session: input.session,
  });
};

export { recordOwnChanges };
