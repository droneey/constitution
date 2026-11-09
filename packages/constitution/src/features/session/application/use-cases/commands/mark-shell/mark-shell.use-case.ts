import type { AbsolutePath } from '#/kernel/value-objects';

import type { SessionId, ToolUseId } from '../../../../domain/session/value-objects';
import { TreeStateStatus } from '../../../../domain/tree-state/entities';
import type { ActiveRulesSource, WorkingTree } from '../../../contracts';
import type { GateRepository } from '../../../contracts/repositories/commands';

interface MarkShellInput {
  readonly call: ToolUseId;
  readonly folderRunIn: AbsolutePath;
  readonly gateRepository: GateRepository;
  readonly session: SessionId;
  readonly source: ActiveRulesSource;
  readonly workingTree: WorkingTree;
}

const markShell = (input: MarkShellInput): void => {
  const place = input.source.findProjectAround(input.source.realPathOf(input.folderRunIn));

  if (place === undefined) {
    return;
  }

  const { repositoryFolderPath } = place;
  const snapshot = input.workingTree.snapshotOf(repositoryFolderPath);

  if (snapshot.status !== TreeStateStatus.Read) {
    return;
  }

  input.gateRepository.keepShellTree({
    call: input.call,
    session: input.session,
    tree: {
      fileSignatures: snapshot.fileSignatures,
      repositoryFolderPath,
    },
  });
};

export { markShell };
