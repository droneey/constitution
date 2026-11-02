import type { AbsolutePath } from '#/kernel/value-objects';

import { DebtKind } from '../../../../domain/gate/entities';
import type { AgentInSession } from '../../../../domain/session/entities';
import type { ToolUseId } from '../../../../domain/session/value-objects';
import { ShellTree, TreeStateStatus } from '../../../../domain/tree-state/entities';
import type { WorkingTree } from '../../../contracts';
import type { GateRepository } from '../../../contracts/repositories/commands';

interface SettleShellInput extends AgentInSession {
  readonly call: ToolUseId;
  readonly gateRepository: GateRepository;
  readonly workingTree: WorkingTree;
}

const settleShell = (input: SettleShellInput): readonly AbsolutePath[] => {
  const before = input.gateRepository.takeShellTree({
    call: input.call,
    session: input.session,
  });

  if (before === undefined) {
    return [];
  }

  const after = input.workingTree.snapshotOf(before.repositoryFolderPath);

  if (after.status !== TreeStateStatus.Read) {
    return [];
  }

  const changed = ShellTree.changedBetween(before.fileSignatures, after.fileSignatures);

  if (changed.length > 0) {
    input.gateRepository.addDebts({
      agent: input.agent,
      debts: changed.map((path) => ({
        kind: DebtKind.Changed,
        path,
      })),
      session: input.session,
    });
  }

  return changed;
};

export { settleShell };
