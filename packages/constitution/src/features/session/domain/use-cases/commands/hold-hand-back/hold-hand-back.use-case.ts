import type { TextHasher } from '../../../contracts';
import type { GateCommandRepository } from '../../../contracts/repositories/commands';
import type { AgentInSession, HandBackStep } from '../../../entities';
import type { TreeFingerprint } from '../../../value-objects';
import { recordRefusalOrPass } from '../shared/refusal-streak';

interface HoldHandBackInput extends AgentInSession {
  readonly fingerprint: TreeFingerprint;
  readonly gates: GateCommandRepository;
  readonly hasher: TextHasher;
  readonly missing: readonly HandBackStep[];
}

const holdHandBack = (input: HoldHandBackInput): boolean =>
  !recordRefusalOrPass({
    agent: input.agent,
    gates: input.gates,
    hasher: input.hasher,
    refused: JSON.stringify({
      handBack: input.fingerprint,
      missing: input.missing,
    }),
    session: input.session,
  });

export { holdHandBack };
