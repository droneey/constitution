import { describe, expect, it } from 'bun:test';

import { testHasher } from '../../../../../__tests__/gate.fixtures';
import { createFakeGateRepository } from '../../../../../__tests__/gate-command-repository.fake';
import { keptSession } from '../../../../../__tests__/session.fixtures';
import { GateEntryKind } from '../../../../../domain/gate/entities';
import { SessionAgent } from '../../../../../domain/session/entities';
import { HandBackStep } from '../../../../../domain/stop-judgement/entities';
import { TreeFingerprint } from '../../../../../domain/tree-state/value-objects';
import type { GateRepository } from '../../../../contracts/repositories/commands';
import { holdHandBack } from '../hold-hand-back.use-case';

const heldOf = (gateRepository: GateRepository): Parameters<typeof holdHandBack>[0] => ({
  agent: SessionAgent.main,
  fingerprint: TreeFingerprint.create('tree-now'),
  gateRepository,
  hasher: testHasher,
  missing: [
    HandBackStep.Check,
    HandBackStep.Review,
  ],
  session: keptSession,
});

const heldThrice = (gateRepository: GateRepository): void => {
  holdHandBack(heldOf(gateRepository));
  holdHandBack(heldOf(gateRepository));
  holdHandBack(heldOf(gateRepository));
};

describe('holdHandBack', () => {
  it('should hold the hand-back of one tree the third time', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    holdHandBack(heldOf(gateRepository));
    holdHandBack(heldOf(gateRepository));

    // Act
    const isHeld = holdHandBack(heldOf(gateRepository));

    // Assert
    expect(isHeld).toBe(true);
  });

  it.each([
    {
      condition: 'the same tree with the same steps missing',
      held: {},
      isHeld: false,
    },
    {
      condition: 'another tree',
      held: {
        fingerprint: TreeFingerprint.create('tree-later'),
      },
      isHeld: true,
    },
    {
      condition: 'other steps missing',
      held: {
        missing: [
          HandBackStep.Check,
        ],
      },
      isHeld: true,
    },
  ])(
    'should say $isHeld for $condition after one tree was held three times',
    ({ held, isHeld }) => {
      // Arrange
      const gateRepository = createFakeGateRepository();

      heldThrice(gateRepository);

      // Act
      const answer = holdHandBack({
        ...heldOf(gateRepository),
        ...held,
      });

      // Assert
      expect(answer).toBe(isHeld);
    },
  );

  it('should note the refusal for the agent that hands back', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    // Act
    holdHandBack(heldOf(gateRepository));

    // Assert
    expect(
      gateRepository
        .gateEntries({
          agent: SessionAgent.main,
          session: keptSession,
        })
        .map((entry) => entry.kind),
    ).toStrictEqual([
      GateEntryKind.Refused,
    ]);
  });
});
