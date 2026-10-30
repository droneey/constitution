import { ConfigReadStatus } from '#/kernel/entities';

import type { FingerprintMark } from '../../../../../domain/session/entities';
import type { SessionId } from '../../../../../domain/session/value-objects';
import { TreeStateStatus } from '../../../../../domain/tree-state/entities';
import type { WorkingTree } from '../../../../contracts';
import type { SessionCommandRepository } from '../../../../contracts/repositories/commands';

interface RecordTreeInput {
  readonly mark: FingerprintMark;
  readonly session: SessionId;
  readonly sessions: SessionCommandRepository;
  readonly workingTree: WorkingTree;
}

const recordTree = (input: RecordTreeInput): void => {
  const state = input.sessions.state(input.session);

  if (state?.status !== ConfigReadStatus.Parsed) {
    return;
  }

  const tree = input.workingTree.stateOf(state.repositoryFolderPath);

  if (tree.status !== TreeStateStatus.Read) {
    return;
  }

  input.sessions.recordFingerprint({
    fingerprint: tree.fingerprint,
    mark: input.mark,
    session: input.session,
  });
};

export { recordTree };
