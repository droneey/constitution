import type { TextHasher } from '../../../../contracts';
import type { GateCommandRepository } from '../../../../contracts/repositories/commands';
import type { AgentInSession } from '../../../../entities';
import { GateEntry, GateEntryKind } from '../../../../entities';
import { RefusalKey } from '../../../../value-objects';

interface RefusalInput extends AgentInSession {
  readonly gates: GateCommandRepository;
  readonly hasher: TextHasher;
  readonly refused: string;
}

const recordRefusalOrPass = (input: RefusalInput): boolean => {
  const key = RefusalKey.create(input.hasher.hashOf(input.refused));
  const isPassed = GateEntry.isPassedAfter(input.gates.gateEntries(input), key);

  input.gates.addGateEntry({
    ...input,
    entry: {
      key,
      kind: isPassed ? GateEntryKind.Passed : GateEntryKind.Refused,
    },
  });

  return isPassed;
};

export type { RefusalInput };
export { recordRefusalOrPass };
