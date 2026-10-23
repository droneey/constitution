import { describe, expect, it } from 'bun:test';

import { sessionStateOf } from '../../../../../__tests__/session.fixtures';
import { createFakeSessionCommands } from '../../__tests__/session-commands.fake';
import { saveSession } from '../save-session.use-case';

describe('saveSession', () => {
  it.each([
    {
      condition: 'the session is a plain name',
      saved: [
        {
          isReminderKept: true,
          session: 'session-1',
          state: sessionStateOf(),
        },
      ],
      session: 'session-1',
    },
    {
      condition: 'the session is not a plain name',
      saved: [],
      session: '../session-1',
    },
  ])(
    'should keep the state, and whether the reminders are kept, only when $condition',
    ({ saved, session }) => {
      // Arrange
      const store = createFakeSessionCommands();

      // Act
      saveSession({
        isReminderKept: true,
        session,
        sessions: store.commands,
        state: sessionStateOf(),
      });

      // Assert
      expect(store.writes).toStrictEqual({
        added: [],
        recorded: [],
        saved,
      });
    },
  );
});
