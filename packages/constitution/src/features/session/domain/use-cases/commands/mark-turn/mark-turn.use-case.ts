import type { WorkingTree } from '#/kernel/contracts';

import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import { SessionMark } from '../../../entities';
import type { SessionId } from '../../../value-objects';
import { fingerprintOf } from '../../shared/checksum';

interface MarkTurnInput {
  readonly session: SessionId;
  readonly sessions: SessionCommandRepository;
  readonly workingTree: WorkingTree;
}

/**
 * Records the fingerprint of the tree as the turn begins, so the gate knows what the turn changed;
 * records nothing when the session keeps no state.
 */
const markTurn = (input: MarkTurnInput): void => {
  const state = input.sessions.state(input.session);

  if (state === undefined) {
    return;
  }

  input.sessions.recordMark({
    mark: SessionMark.Turn,
    session: input.session,
    value: fingerprintOf({
      project: state.project,
      workingTree: input.workingTree,
    }),
  });
};

export { markTurn };
