import { describe, expect, it } from 'bun:test';

import { createFakeGateCommandRepository } from '../../../../../__tests__/gate-command-repository.fake';
import { keptSession } from '../../../../../__tests__/session.fixtures';
import type { GateCommandRepository } from '../../../../contracts/repositories/commands';
import type { AgentInSession } from '../../../../entities';
import { GateEntryKind, SessionAgent } from '../../../../entities';
import { RefusalKey } from '../../../../value-objects';
import { tellPasses } from '../tell-passes.use-case';

const agent: AgentInSession = {
  agent: SessionAgent.main,
  session: keptSession,
};

const passedTwice = (gates: GateCommandRepository): void => {
  const passed = {
    ...agent,
    entry: {
      key: RefusalKey.create('0123456789abcdef'),
      kind: GateEntryKind.Passed,
    },
  } as const;

  gates.addGateEntry(passed);
  gates.addGateEntry(passed);
};

describe('tellPasses', () => {
  it('should tell the passes since they were last told', () => {
    // Arrange
    const gates = createFakeGateCommandRepository();

    passedTwice(gates);

    // Act
    const told = tellPasses({
      ...agent,
      gates,
    });

    // Assert
    expect(told).toBe(2);
  });

  it('should tell no pass once the passes were told', () => {
    // Arrange
    const gates = createFakeGateCommandRepository();

    passedTwice(gates);
    tellPasses({
      ...agent,
      gates,
    });

    // Act
    const told = tellPasses({
      ...agent,
      gates,
    });

    // Assert
    expect(told).toBe(0);
  });

  it('should note nothing when no action passed since the passes were last told', () => {
    // Arrange
    const gates = createFakeGateCommandRepository();

    // Act
    tellPasses({
      ...agent,
      gates,
    });

    // Assert
    expect(gates.gateEntries(agent)).toStrictEqual([]);
  });
});
