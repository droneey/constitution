import { describe, expect, it } from 'bun:test';

import { createFakeWorkingTree } from '#/__tests__/working-tree.fake';

import {
  heldSessionsOf,
  keptSession,
  sessionStateOf,
} from '../../../../../__tests__/session.fixtures';
import { createFakeSessionCommandRepository } from '../../../../../__tests__/session-command-repository.fake';
import { CheckState, SessionMark } from '../../../../entities';
import { SessionId } from '../../../../value-objects';
import { recordCheck } from '../record-check.use-case';

// The tree's state reads "hello", whose POSIX cksum is 3287646509.
const TREE = 'hello';
const FINGERPRINT = '3287646509';

describe('recordCheck', () => {
  it.each([
    {
      checked: FINGERPRINT,
      command: 'bun run check',
      condition: 'the command is the check',
    },
    {
      checked: FINGERPRINT,
      command: 'bun run check --verbose',
      condition: 'the check opens the command and a blank ends it',
    },
    {
      checked: FINGERPRINT,
      command: 'bun run check; echo done',
      condition: 'the check opens the command and a semicolon ends it',
    },
    {
      checked: FINGERPRINT,
      command: 'cd app && bun run check',
      condition: 'the check ends the command after &&',
    },
    {
      checked: FINGERPRINT,
      command: 'cd app && bun run check | tee log',
      condition: 'the check follows && and a blank ends it',
    },
    {
      checked: FINGERPRINT,
      command: 'cd app && bun run check; echo done',
      condition: 'the check follows && and a semicolon ends it',
    },
    {
      checked: FINGERPRINT,
      command: 'cd app; bun run check',
      condition: 'the check ends the command after a semicolon',
    },
    {
      checked: FINGERPRINT,
      command: 'cd app; bun run check | tee log',
      condition: 'the check follows a semicolon and a blank ends it',
    },
    {
      checked: FINGERPRINT,
      command: 'cd app; bun run check;',
      condition: 'the check follows a semicolon and a semicolon ends it',
    },
    {
      checked: undefined,
      command: 'bun run checkout',
      condition: 'the command only starts with the check',
    },
    {
      checked: undefined,
      command: 'echo bun run check',
      condition: 'the check follows a blank',
    },
    {
      checked: undefined,
      command: 'cd app && bun run checkout',
      condition: 'a longer command follows &&',
    },
    {
      checked: undefined,
      command: 'cd app; bun run checkout',
      condition: 'a longer command follows a semicolon',
    },
    {
      checked: undefined,
      command: 'cd app &&bun run check',
      condition: 'no blank follows &&',
    },
    {
      checked: undefined,
      command: '',
      condition: 'the command is empty',
    },
  ])('should leave $checked as the tree checked when $condition', ({ checked, command }) => {
    // Arrange
    const store = heldSessionsOf();

    // Act
    recordCheck({
      command,
      session: keptSession,
      sessions: createFakeSessionCommandRepository(store),
      workingTree: createFakeWorkingTree({
        state: TREE,
      }),
    });

    // Assert
    expect(store.get(keptSession)?.marks.get(SessionMark.Checked)).toBe(checked);
  });

  it.each([
    {
      command: 'bun run check; ',
      condition: 'the session kept no state',
      session: SessionId.create('session-2'),
      state: sessionStateOf(),
    },
    {
      command: 'bun run check; ',
      condition: 'the project names no check',
      session: keptSession,
      state: sessionStateOf({
        check: CheckState.create(),
      }),
    },
    {
      command: 'undefined;',
      condition: 'the project names no check and the command is the text of its absence',
      session: keptSession,
      state: sessionStateOf({
        check: CheckState.create(),
      }),
    },
    {
      command: 'bun run check; ',
      condition: 'constitution.yaml did not parse',
      session: keptSession,
      state: sessionStateOf({
        check: CheckState.unparsed(),
      }),
    },
  ])('should record nothing when $condition', ({ command, session, state }) => {
    // Arrange
    const store = heldSessionsOf({
      state,
    });

    // Act
    recordCheck({
      command,
      session,
      sessions: createFakeSessionCommandRepository(store),
      workingTree: createFakeWorkingTree({
        state: TREE,
      }),
    });

    // Assert
    expect(store.get(session)?.marks.get(SessionMark.Checked)).toBeUndefined();
  });
});
