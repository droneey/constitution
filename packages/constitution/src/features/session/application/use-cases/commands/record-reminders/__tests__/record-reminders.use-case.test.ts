import { describe, expect, it } from 'bun:test';

import { BlockId } from '#/kernel/value-objects';

import { heldSessionsOf, keptSession } from '../../../../../__tests__/session.fixtures';
import { createFakeSessionCommandRepository } from '../../../../../__tests__/session-command-repository.fake';
import { SessionAgent } from '../../../../../domain/session/entities';
import { AgentId } from '../../../../../domain/session/value-objects';
import { recordReminders } from '../record-reminders.use-case';

describe('recordReminders', () => {
  it.each<{
    asker: {
      agent: SessionAgent;
    };
    condition: string;
  }>([
    {
      asker: {
        agent: SessionAgent.main,
      },
      condition: 'the session itself was reminded',
    },
    {
      asker: {
        agent: AgentId.create('agent-1'),
      },
      condition: 'an agent of the session was reminded',
    },
  ])('should record the blocks named when $condition', ({ asker }) => {
    // Arrange
    const store = heldSessionsOf();

    // Act
    recordReminders({
      ...asker,
      ids: [
        BlockId.create('ui'),
        BlockId.create('typescript'),
      ],
      session: keptSession,
      sessions: createFakeSessionCommandRepository(store),
    });

    // Assert
    expect(store.get(keptSession)?.reminded.get(asker.agent)).toStrictEqual(
      new Set([
        BlockId.create('ui'),
        BlockId.create('typescript'),
      ]),
    );
  });

  it('should record nothing when no block was named', () => {
    // Arrange
    const store = heldSessionsOf();

    // Act
    recordReminders({
      agent: SessionAgent.main,
      ids: [],
      session: keptSession,
      sessions: createFakeSessionCommandRepository(store),
    });

    // Assert
    expect(store.get(keptSession)?.reminded).toStrictEqual(new Map());
  });
});
