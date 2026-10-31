import type { GateCommandRepository } from '../../../contracts/repositories/commands';
import type { AgentInSession } from '../../../entities';
import { GateEntry, GateEntryKind } from '../../../entities';

interface TellPassesInput extends AgentInSession {
  readonly gates: GateCommandRepository;
}

const tellPasses = (input: TellPassesInput): number => {
  const passes = GateEntry.untoldPassesOf(input.gates.gateEntries(input));

  if (passes > 0) {
    input.gates.addGateEntry({
      ...input,
      entry: {
        kind: GateEntryKind.Told,
      },
    });
  }

  return passes;
};

export { tellPasses };
