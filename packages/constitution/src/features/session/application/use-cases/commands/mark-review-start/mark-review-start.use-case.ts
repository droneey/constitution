import { SessionMark } from '../../../../domain/session/entities';
import type { SessionId } from '../../../../domain/session/value-objects';
import { AgentKind } from '../../../../domain/session/value-objects';
import type { WorkingTree } from '../../../contracts';
import type { SessionRepository } from '../../../contracts/repositories/commands';
import { recordTree } from '../shared/record-tree';

interface MarkReviewStartInput {
  readonly agentType?: string;
  readonly session: SessionId;
  readonly sessionRepository: SessionRepository;
  readonly workingTree: WorkingTree;
}

const markReviewStart = (input: MarkReviewStartInput): void => {
  if (!AgentKind.isReviewer(input.agentType)) {
    return;
  }

  recordTree({
    mark: SessionMark.ReviewStarted,
    session: input.session,
    sessionRepository: input.sessionRepository,
    workingTree: input.workingTree,
  });
};

export { markReviewStart };
