import type { AbsolutePath } from '#/kernel/value-objects';

import type { ActiveRulesSource } from '../../../contracts';
import type { GateCommandRepository } from '../../../contracts/repositories/commands';
import type { SessionId } from '../../../value-objects';

interface SweepStaleSessionsInput {
  readonly gates: GateCommandRepository;
  readonly searchFrom: AbsolutePath;
  readonly session: SessionId;
  readonly source: ActiveRulesSource;
}

const sweepStaleSessions = (input: SweepStaleSessionsInput): void => {
  const place = input.source.findProjectAround(input.searchFrom);

  if (place === undefined) {
    return;
  }

  input.gates.sweepStaleSessions({
    projectFolderPath: place.repositoryFolderPath,
    session: input.session,
  });
};

export { sweepStaleSessions };
