import { describe, expect, it } from 'bun:test';

import type { ProjectPlace } from '#/kernel/entities';
import { AbsolutePath } from '#/kernel/value-objects';

import { createFakeActiveRulesSource } from '../../../../../__tests__/active-rules-source.fake';
import { testHasher } from '../../../../../__tests__/gate.fixtures';
import { createFakeGateCommandRepository } from '../../../../../__tests__/gate-command-repository.fake';
import { keptSession } from '../../../../../__tests__/session.fixtures';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import type { ActiveRulesSource } from '../../../../contracts';
import { ActiveReadStatus } from '../../../../contracts';
import type { GateCommandRepository } from '../../../../contracts/repositories/commands';
import type { GateVerdict, RuleDebt } from '../../../../entities';
import { DebtKind, GateCauseKind, GateVerdictKind, SessionAgent } from '../../../../entities';
import { gateTurn } from '../gate-turn.use-case';

const otherPlace: ProjectPlace = {
  releaseFolderPath: AbsolutePath.create('/work/other/.droneey/constitution'),
  repositoryFolderPath: AbsolutePath.create('/work/other'),
};
const withOtherProject: ActiveRulesSource = {
  ...createFakeActiveRulesSource({
    activeByRelease: {
      [otherPlace.releaseFolderPath]: {
        status: ActiveReadStatus.NoRelease,
      },
    },
  }),
  findProjectAround: (searchFrom: AbsolutePath): ProjectPlace | undefined =>
    searchFrom.startsWith('/work/other')
      ? otherPlace
      : createFakeActiveRulesSource().findProjectAround(searchFrom),
};

const turnOf = (input: { gates: GateCommandRepository; isHookActive?: boolean }): GateVerdict =>
  gateTurn({
    agent: SessionAgent.main,
    gates: input.gates,
    hasher: testHasher,
    isHookActive: input.isHookActive ?? false,
    session: keptSession,
    source: withOtherProject,
    workingTree: createFakeWorkingTree(),
  });

const gatesOwing = (debts: readonly RuleDebt[]): GateCommandRepository => {
  const gates = createFakeGateCommandRepository();

  gates.addDebts({
    agent: SessionAgent.main,
    debts,
    session: keptSession,
  });

  return gates;
};

describe('gateTurn', () => {
  it('should let the turn end when the agent owes no rule', () => {
    // Arrange
    const gates = createFakeGateCommandRepository();

    // Act
    const verdict = turnOf({
      gates,
    });

    // Assert
    expect(verdict).toStrictEqual({
      kind: GateVerdictKind.Allowed,
    });
  });

  it('should hold the turn while the rules of a file the agent read are unread', () => {
    // Arrange
    const gates = gatesOwing([
      {
        kind: DebtKind.Read,
        path: AbsolutePath.create('/work/project/src/a.ts'),
      },
    ]);

    // Act
    const verdict = turnOf({
      gates,
    });

    // Assert
    expect(verdict.kind).toBe(GateVerdictKind.Refused);
  });

  it('should let the turn end while the stop hook is active, though the agent owes rules', () => {
    // Arrange
    const gates = gatesOwing([
      {
        kind: DebtKind.Read,
        path: AbsolutePath.create('/work/project/src/a.ts'),
      },
    ]);

    // Act
    const verdict = turnOf({
      gates,
      isHookActive: true,
    });

    // Assert
    expect(verdict).toStrictEqual({
      kind: GateVerdictKind.Allowed,
    });
  });

  it('should close the turn, naming why, when a file the agent read lies in a project that cannot be read', () => {
    // Arrange
    const gates = gatesOwing([
      {
        kind: DebtKind.Read,
        path: AbsolutePath.create('/work/other/a.ts'),
      },
    ]);

    // Act
    const verdict = turnOf({
      gates,
    });

    // Assert
    expect(verdict).toStrictEqual({
      causes: [
        {
          kind: GateCauseKind.NoRelease,
          releaseFolderPath: otherPlace.releaseFolderPath,
        },
      ],
      kind: GateVerdictKind.Closed,
    });
  });
});
