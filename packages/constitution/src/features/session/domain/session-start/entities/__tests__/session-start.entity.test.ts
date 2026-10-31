import { describe, expect, it } from 'bun:test';

import { HookEventName } from '../../../shared/entities';
import { SessionOrigin, SessionStart } from '../session-start.entity';

describe('SessionStart', () => {
  it.each([
    {
      event: HookEventName.SessionStart,
      keeps: true,
    },
    {
      event: HookEventName.SubagentStart,
      keeps: false,
    },
  ])('should say $keeps whether a $event keeps the state', ({ event, keeps }) => {
    // Act
    const answer = SessionStart.keepsState(event);

    // Assert
    expect(answer).toBe(keeps);
  });

  it.each([
    {
      keeps: true,
      origin: SessionOrigin.Resume,
    },
    {
      keeps: false,
      origin: SessionOrigin.Startup,
    },
    {
      keeps: false,
      origin: SessionOrigin.Clear,
    },
  ])(
    'should say $keeps whether a session from $origin keeps its reminders',
    ({ keeps, origin }) => {
      // Act
      const answer = SessionStart.keepsReminders(origin);

      // Assert
      expect(answer).toBe(keeps);
    },
  );

  it.each([
    {
      event: HookEventName.SessionStart,
      isStartup: true,
      origin: SessionOrigin.Startup,
    },
    {
      event: HookEventName.SessionStart,
      isStartup: false,
      origin: SessionOrigin.Resume,
    },
    {
      event: HookEventName.SubagentStart,
      isStartup: false,
      origin: SessionOrigin.Startup,
    },
  ])(
    'should say $isStartup whether a $event from $origin starts the session up',
    ({ isStartup, ...start }) => {
      // Act
      const answer = SessionStart.isStartup(start);

      // Assert
      expect(answer).toBe(isStartup);
    },
  );
});
