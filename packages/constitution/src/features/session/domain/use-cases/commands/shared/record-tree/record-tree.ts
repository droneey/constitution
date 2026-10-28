import { ConfigReadStatus } from '#/kernel/entities';

import type { WorkingTree } from '../../../../contracts';
import { TreeStateStatus } from '../../../../contracts';
import type { SessionCommandRepository } from '../../../../contracts/repositories/commands';
import type { FingerprintMark } from '../../../../entities';
import type { SessionId } from '../../../../value-objects';

interface RecordTreeInput {
  readonly mark: FingerprintMark;
  readonly session: SessionId;
  readonly sessions: SessionCommandRepository;
  readonly workingTree: WorkingTree;
}

/**
 * Records the fingerprint of the session's tree under the mark; records nothing when the session
 * keeps no rules or git cannot report the tree.
 */
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
