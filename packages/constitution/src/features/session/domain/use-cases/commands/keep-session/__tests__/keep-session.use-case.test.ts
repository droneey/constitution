import { describe, expect, it } from 'bun:test';

import { keptSession, sessionStateOf } from '../../../../../__tests__/session.fixtures';
import { createFakeSessionCommandRepository } from '../../../../../__tests__/session-command-repository.fake';
import { HookEventName, SessionOrigin } from '../../../../entities';
import { keepSession } from '../keep-session.use-case';

const savedState = sessionStateOf();

describe('keepSession', () => {
  it.each([
    {
      condition: 'a session starts up',
      isReminderKept: false,
      origin: SessionOrigin.Startup,
    },
    {
      condition: 'a session resumes',
      isReminderKept: true,
      origin: SessionOrigin.Resume,
    },
  ])(
    'should keep the state, and what was reminded only on a resume, when $condition',
    ({ isReminderKept, origin }) => {
      // Arrange
      const store = createFakeSessionCommandRepository();

      // Act
      keepSession({
        event: HookEventName.SessionStart,
        origin,
        session: keptSession,
        sessions: store.sessions,
        state: savedState,
      });

      // Assert
      expect(store.writes.saved).toStrictEqual([
        {
          isReminderKept,
          session: keptSession,
          state: savedState,
        },
      ]);
    },
  );

  it.each([
    {
      condition: 'a subagent starts',
      event: HookEventName.SubagentStart,
      state: savedState,
    },
    {
      condition: 'the start gave no state',
      event: HookEventName.SessionStart,
      state: undefined,
    },
  ])('should keep nothing when $condition', ({ event, state }) => {
    // Arrange
    const store = createFakeSessionCommandRepository();

    // Act
    keepSession({
      event,
      origin: SessionOrigin.Startup,
      session: keptSession,
      sessions: store.sessions,
      state,
    });

    // Assert
    expect(store.writes.saved).toStrictEqual([]);
  });
});
