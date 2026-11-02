import type { AbsolutePath } from '#/kernel/value-objects';

import type { SessionId } from '../../../../domain/session/value-objects';
import type { ActiveRulesSource } from '../../../contracts';
import type { GateRepository } from '../../../contracts/repositories/commands';

interface SweepStaleSessionsInput {
  readonly gateRepository: GateRepository;
  readonly searchFrom: AbsolutePath;
  readonly session: SessionId;
  readonly source: ActiveRulesSource;
}

const sweepStaleSessions = (input: SweepStaleSessionsInput): void => {
  const place = input.source.findProjectAround(input.searchFrom);

  if (place === undefined) {
    return;
  }

  input.gateRepository.sweepStaleSessions({
    projectFolderPath: place.repositoryFolderPath,
    session: input.session,
  });
};

export { sweepStaleSessions };
