import type { AbsolutePath } from '#/kernel/value-objects';

import type { ActiveRulesSource, WorkingTree } from '../../../contracts';
import { TreeStateStatus } from '../../../contracts';
import type { GateCommandRepository } from '../../../contracts/repositories/commands';
import type { SessionId, ToolUseId } from '../../../value-objects';

interface MarkShellInput {
  readonly call: ToolUseId;
  readonly folderRunIn: AbsolutePath;
  readonly gates: GateCommandRepository;
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

  input.gates.keepShellTree({
    call: input.call,
    session: input.session,
    tree: {
      fileSignatures: snapshot.fileSignatures,
      repositoryFolderPath,
    },
  });
};

export { markShell };
