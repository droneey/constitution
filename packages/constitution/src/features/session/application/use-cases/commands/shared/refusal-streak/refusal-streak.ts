import { GateEntry, GateEntryKind } from '../../../../../domain/gate/entities';
import { RefusalKey } from '../../../../../domain/gate/value-objects';
import type { AgentInSession } from '../../../../../domain/session/entities';
import type { TextHasher } from '../../../../contracts';
import type { GateRepository } from '../../../../contracts/repositories/commands';

interface RefusalInput extends AgentInSession {
  readonly gateRepository: GateRepository;
  readonly hasher: TextHasher;
  readonly refused: string;
}

const recordRefusalOrPass = (input: RefusalInput): boolean => {
  const key = RefusalKey.create(input.hasher.hashOf(input.refused));
  const isPassed = GateEntry.isPassedAfter(input.gateRepository.gateEntries(input), key);

  input.gateRepository.addGateEntry({
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
