import type { AgentInSession } from '../../../../domain/session/entities';
import type { HandBackStep } from '../../../../domain/stop-judgement/entities';
import type { TreeFingerprint } from '../../../../domain/tree-state/value-objects';
import type { TextHasher } from '../../../contracts';
import type { GateRepository } from '../../../contracts/repositories/commands';
import { recordRefusalOrPass } from '../shared/refusal-streak';

interface HoldHandBackInput extends AgentInSession {
  readonly fingerprint: TreeFingerprint;
  readonly gateRepository: GateRepository;
  readonly hasher: TextHasher;
  readonly missing: readonly HandBackStep[];
}

const holdHandBack = (input: HoldHandBackInput): boolean =>
  !recordRefusalOrPass({
    agent: input.agent,
    gateRepository: input.gateRepository,
    hasher: input.hasher,
    refused: JSON.stringify({
      handBack: input.fingerprint,
      missing: input.missing,
    }),
    session: input.session,
  });

export { holdHandBack };
