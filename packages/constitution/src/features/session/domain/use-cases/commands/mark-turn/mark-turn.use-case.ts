import type { WorkingTree } from '../../../contracts';
import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import { SessionMark } from '../../../entities';
import type { SessionId } from '../../../value-objects';
import { recordTree } from '../shared/record-tree';

interface MarkTurnInput {
  readonly session: SessionId;
  readonly sessions: SessionCommandRepository;
  readonly workingTree: WorkingTree;
}

const markTurn = (input: MarkTurnInput): void => {
  recordTree({
    ...input,
    mark: SessionMark.Turn,
  });
};

export { markTurn };
