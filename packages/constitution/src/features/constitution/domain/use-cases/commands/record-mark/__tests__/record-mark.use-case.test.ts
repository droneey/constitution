import { describe, expect, it } from 'bun:test';

import { SessionMark } from '../../../../entities';
import { createFakeSessionCommands } from '../../__tests__/session-commands.fake';
import { recordMark } from '../record-mark.use-case';

describe('recordMark', () => {
  it.each([
    {
      condition: 'the session is a plain name',
      recorded: [
        {
          mark: SessionMark.Checked,
          session: 'session-1',
          value: '3287646509',
        },
      ],
      session: 'session-1',
    },
    {
      condition: 'the session is not a plain name',
      recorded: [],
      session: '../session-1',
    },
  ])('should record the fingerprint only when $condition', ({ recorded, session }) => {
    // Arrange
    const store = createFakeSessionCommands();

    // Act
    recordMark({
      mark: SessionMark.Checked,
      session,
      sessions: store.commands,
      value: '3287646509',
    });

    // Assert
    expect(store.writes).toStrictEqual({
      added: [],
      recorded,
      saved: [],
    });
  });
});
