import { describe, expect, it } from 'bun:test';

import { testHasher } from '../../../../../__tests__/gate.fixtures';
import { createFakeGateCommandRepository } from '../../../../../__tests__/gate-command-repository.fake';
import { keptSession } from '../../../../../__tests__/session.fixtures';
import type { GateCommandRepository } from '../../../../contracts/repositories/commands';
import { GateEntryKind, HandBackStep, SessionAgent } from '../../../../entities';
import { TreeFingerprint } from '../../../../value-objects';
import { holdHandBack } from '../hold-hand-back.use-case';

const heldOf = (gates: GateCommandRepository): Parameters<typeof holdHandBack>[0] => ({
  agent: SessionAgent.main,
  fingerprint: TreeFingerprint.create('tree-now'),
  gates,
  hasher: testHasher,
  missing: [
    HandBackStep.Check,
    HandBackStep.Review,
  ],
  session: keptSession,
});

const heldThrice = (gates: GateCommandRepository): void => {
  holdHandBack(heldOf(gates));
  holdHandBack(heldOf(gates));
  holdHandBack(heldOf(gates));
};

describe('holdHandBack', () => {
  it('should hold the hand-back of one tree the third time', () => {
    // Arrange
    const gates = createFakeGateCommandRepository();

    holdHandBack(heldOf(gates));
    holdHandBack(heldOf(gates));

    // Act
    const isHeld = holdHandBack(heldOf(gates));

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
      const gates = createFakeGateCommandRepository();

      heldThrice(gates);

      // Act
      const answer = holdHandBack({
        ...heldOf(gates),
        ...held,
      });

      // Assert
      expect(answer).toBe(isHeld);
    },
  );

  it('should note the refusal for the agent that hands back', () => {
    // Arrange
    const gates = createFakeGateCommandRepository();

    // Act
    holdHandBack(heldOf(gates));

    // Assert
    expect(
      gates
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
