import { describe, expect, it } from 'bun:test';

import { BlockId } from '#/kernel/value-objects';

import { keptSession } from '../../../../../__tests__/session.fixtures';
import { createFakeSessionCommandRepository } from '../../../../../__tests__/session-command-repository.fake';
import { AgentId } from '../../../../value-objects';
import { recordReminders } from '../record-reminders.use-case';

describe('recordReminders', () => {
  it.each<{
    asker: {
      agent: AgentId | undefined;
    };
    condition: string;
  }>([
    {
      asker: {
        agent: undefined,
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
    const store = createFakeSessionCommandRepository();

    // Act
    recordReminders({
      ...asker,
      ids: [
        BlockId.create('ui'),
        BlockId.create('typescript'),
      ],
      session: keptSession,
      sessions: store.sessions,
    });

    // Assert
    expect(store.writes.added).toStrictEqual([
      {
        ...asker,
        ids: [
          BlockId.create('ui'),
          BlockId.create('typescript'),
        ],
        session: keptSession,
      },
    ]);
  });

  it('should record nothing when no block was named', () => {
    // Arrange
    const store = createFakeSessionCommandRepository();

    // Act
    recordReminders({
      agent: undefined,
      ids: [],
      session: keptSession,
      sessions: store.sessions,
    });

    // Assert
    expect(store.writes.added).toStrictEqual([]);
  });
});
