import { describe, expect, it } from 'bun:test';

import {
  heldSessionsOf,
  keptSession,
  startedSessionsOf,
} from '../../../../../__tests__/session.fixtures';
import { createFakeSessionQueries } from '../../../../../__tests__/session-query-repository.fake';
import { SessionId } from '../../../../../domain/session/value-objects';
import { isSessionStarted } from '../is-session-started.use-case';

describe('isSessionStarted', () => {
  it.each([
    {
      condition: 'its state is kept',
      held: heldSessionsOf(),
      isStarted: true,
      session: keptSession,
    },
    {
      condition: 'its start kept no state but is recorded',
      held: startedSessionsOf(),
      isStarted: true,
      session: keptSession,
    },
    {
      condition: 'nothing of it is kept or started',
      held: heldSessionsOf(),
      isStarted: false,
      session: SessionId.create('session-2'),
    },
  ])('should answer $isStarted when $condition', ({ held, isStarted, session }) => {
    // Act
    const answer = isSessionStarted({
      session,
      sessionQueries: createFakeSessionQueries(held),
    });

    // Assert
    expect(answer).toBe(isStarted);
  });
});
