import { describe, expect, it } from 'bun:test';

import { sessionStateOf } from '../../../../../__tests__/session.fixtures';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import { createFakeSessionQueries } from '../../__tests__/session-queries.fake';
import { fingerprintSession, judgeCheckRun } from '../fingerprint-session.use-case';

// The tree's state reads "hello", whose POSIX cksum is 3287646509.
const TREE = 'hello';
const FINGERPRINT = '3287646509';

describe('fingerprintSession', () => {
  it('should give the state and the fingerprint of the tree when the session keeps its state', () => {
    // Arrange
    const sessions = createFakeSessionQueries({
      states: {
        'session-1': sessionStateOf(),
      },
    });

    // Act
    const fingerprinted = fingerprintSession({
      session: 'session-1',
      sessions: sessions,
      workingTree: createFakeWorkingTree({
        state: TREE,
      }),
    });

    // Assert
    expect(fingerprinted).toStrictEqual({
      fingerprint: FINGERPRINT,
      state: sessionStateOf(),
    });
  });

  it.each([
    {
      condition: 'the session is not a plain name',
      session: 'x/y',
      state: sessionStateOf(),
    },
    {
      condition: 'the session kept no state',
      session: 'session-2',
      state: sessionStateOf(),
    },
    {
      condition: 'the state names no project',
      session: 'session-1',
      state: sessionStateOf({
        project: '',
      }),
    },
  ])('should give nothing when $condition', ({ session, state }) => {
    // Arrange
    const sessions = createFakeSessionQueries({
      states: {
        'session-1': state,
        'x/y': state,
      },
    });

    // Act
    const fingerprinted = fingerprintSession({
      session,
      sessions: sessions,
      workingTree: createFakeWorkingTree({
        state: TREE,
      }),
    });

    // Assert
    expect(fingerprinted).toBeUndefined();
  });
});

describe('judgeCheckRun', () => {
  it.each([
    {
      command: 'bun run check',
      condition: 'the command is the check',
      fingerprint: FINGERPRINT,
    },
    {
      command: 'bun run check --verbose',
      condition: 'the check opens the command and a blank ends it',
      fingerprint: FINGERPRINT,
    },
    {
      command: 'bun run check; echo done',
      condition: 'the check opens the command and a semicolon ends it',
      fingerprint: FINGERPRINT,
    },
    {
      command: 'cd app && bun run check',
      condition: 'the check ends the command after &&',
      fingerprint: FINGERPRINT,
    },
    {
      command: 'cd app && bun run check | tee log',
      condition: 'the check follows && and a blank ends it',
      fingerprint: FINGERPRINT,
    },
    {
      command: 'cd app && bun run check; echo done',
      condition: 'the check follows && and a semicolon ends it',
      fingerprint: FINGERPRINT,
    },
    {
      command: 'cd app; bun run check',
      condition: 'the check ends the command after a semicolon',
      fingerprint: FINGERPRINT,
    },
    {
      command: 'cd app; bun run check | tee log',
      condition: 'the check follows a semicolon and a blank ends it',
      fingerprint: FINGERPRINT,
    },
    {
      command: 'cd app; bun run check;',
      condition: 'the check follows a semicolon and a semicolon ends it',
      fingerprint: FINGERPRINT,
    },
    {
      command: 'bun run checkout',
      condition: 'the command only starts with the check',
      fingerprint: undefined,
    },
    {
      command: 'echo bun run check',
      condition: 'the check follows a blank',
      fingerprint: undefined,
    },
    {
      command: 'cd app && bun run checkout',
      condition: 'a longer command follows &&',
      fingerprint: undefined,
    },
    {
      command: 'cd app; bun run checkout',
      condition: 'a longer command follows a semicolon',
      fingerprint: undefined,
    },
    {
      command: 'cd app &&bun run check',
      condition: 'no blank follows &&',
      fingerprint: undefined,
    },
    {
      command: '',
      condition: 'the command is empty',
      fingerprint: undefined,
    },
  ])('should give the fingerprint $fingerprint when $condition', ({ command, fingerprint }) => {
    // Arrange
    const sessions = createFakeSessionQueries({
      states: {
        'session-1': sessionStateOf(),
      },
    });

    // Act
    const given = judgeCheckRun({
      command,
      session: 'session-1',
      sessions: sessions,
      workingTree: createFakeWorkingTree({
        state: TREE,
      }),
    });

    // Assert
    expect(given).toBe(fingerprint);
  });

  it.each([
    {
      condition: 'the session is not a plain name',
      session: 'x/y',
      state: sessionStateOf(),
    },
    {
      condition: 'the session kept no state',
      session: 'session-2',
      state: sessionStateOf(),
    },
    {
      condition: 'the state names no project',
      session: 'session-1',
      state: sessionStateOf({
        project: '',
      }),
    },
    {
      condition: 'the project names no check',
      session: 'session-1',
      state: sessionStateOf({
        check: '',
      }),
    },
    {
      condition: 'constitution.yaml did not parse',
      session: 'session-1',
      state: {
        active: [],
        musts: [],
        project: '/work/project',
      },
    },
  ])('should give nothing when $condition', ({ session, state }) => {
    // Arrange
    const sessions = createFakeSessionQueries({
      states: {
        'session-1': state,
        'x/y': state,
      },
    });

    // Act
    const given = judgeCheckRun({
      command: 'bun run check; ',
      session,
      sessions: sessions,
      workingTree: createFakeWorkingTree({
        state: TREE,
      }),
    });

    // Assert
    expect(given).toBeUndefined();
  });
});
