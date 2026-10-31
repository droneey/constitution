import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { notingSessionWritesOf } from '../../../../../__tests__/gate.fixtures';
import {
  heldSessionsOf,
  keptSession,
  ownChangesIn,
  reviewDebtIn,
} from '../../../../../__tests__/session.fixtures';
import { createFakeSessionCommandRepository } from '../../../../../__tests__/session-command-repository.fake';
import { SessionAgent } from '../../../../entities';
import { AgentId } from '../../../../value-objects';
import { handOverChanges } from '../hand-over-changes.use-case';

const subagent = AgentId.create('agent-1');
const path = AbsolutePath.create('/work/project/src/a.ts');

const handOverOf = (agent: SessionAgent) => {
  const held = heldSessionsOf();
  const sessions = createFakeSessionCommandRepository(held);

  for (const changer of [
    subagent,
    SessionAgent.main,
  ] satisfies SessionAgent[]) {
    sessions.addOwnChanges({
      agent: changer,
      paths: [
        path,
      ],
      session: keptSession,
    });
  }

  handOverChanges({
    agent,
    session: keptSession,
    sessions,
  });

  return {
    debt: reviewDebtIn(held, keptSession),
    main: ownChangesIn(held, {
      agent: SessionAgent.main,
      session: keptSession,
    }),
    subagent: ownChangesIn(held, {
      agent: subagent,
      session: keptSession,
    }),
  };
};

describe('handOverChanges', () => {
  it("should owe the coordinator the review of a subagent's own changes, and forget them as the subagent's", () => {
    // Act
    const handed = handOverOf(subagent);

    // Assert
    expect(handed).toStrictEqual({
      debt: [
        {
          agent: subagent,
          path,
        },
      ],
      main: [
        path,
      ],
      subagent: [],
    });
  });

  it('should hand nothing over when the session itself stops', () => {
    // Act
    const handed = handOverOf(SessionAgent.main);

    // Assert
    expect(handed.debt).toStrictEqual([]);
  });

  it('should write nothing when the subagent changed nothing itself', () => {
    // Arrange
    const noted = notingSessionWritesOf(createFakeSessionCommandRepository(heldSessionsOf()));

    // Act
    handOverChanges({
      agent: AgentId.create('agent-2'),
      session: keptSession,
      sessions: noted.store,
    });

    // Assert
    expect(noted.writes).toStrictEqual([]);
  });
});
