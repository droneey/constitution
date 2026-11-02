import { GateEntry, GateEntryKind } from '../../../../domain/gate/entities';
import type { AgentInSession } from '../../../../domain/session/entities';
import type { GateRepository } from '../../../contracts/repositories/commands';

interface TellPassesInput extends AgentInSession {
  readonly gateRepository: GateRepository;
}

const tellPasses = (input: TellPassesInput): number => {
  const passes = GateEntry.untoldPassesOf(input.gateRepository.gateEntries(input));

  if (passes > 0) {
    input.gateRepository.addGateEntry({
      ...input,
      entry: {
        kind: GateEntryKind.Told,
      },
    });
  }

  return passes;
};

export { tellPasses };
