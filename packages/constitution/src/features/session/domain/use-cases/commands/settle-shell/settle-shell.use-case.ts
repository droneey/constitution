import type { AbsolutePath } from '#/kernel/value-objects';

import type { WorkingTree } from '../../../contracts';
import { TreeStateStatus } from '../../../contracts';
import type { GateCommandRepository } from '../../../contracts/repositories/commands';
import type { AgentInSession } from '../../../entities';
import { DebtKind, ShellTree } from '../../../entities';
import type { ToolUseId } from '../../../value-objects';

interface SettleShellInput extends AgentInSession {
  readonly call: ToolUseId;
  readonly gates: GateCommandRepository;
  readonly workingTree: WorkingTree;
}

const settleShell = (input: SettleShellInput): readonly AbsolutePath[] => {
  const before = input.gates.takeShellTree({
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
    input.gates.addDebts({
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
