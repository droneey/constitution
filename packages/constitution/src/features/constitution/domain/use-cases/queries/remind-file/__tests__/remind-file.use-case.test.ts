import { describe, expect, it } from 'bun:test';

import { activeBlockOf, SESSION, sessionStateOf } from '../../../../../__tests__/session.fixtures';
import { createFakeSessionQueries } from '../../__tests__/session-queries.fake';
import { remindFile } from '../remind-file.use-case';

const UI = activeBlockOf({
  files: [
    'blocks/domains/ui/ui.md',
    'blocks/domains/ui/foundation/ui.md',
  ],
  globs: [
    '**/ui/**',
  ],
  id: 'ui',
});
const TYPESCRIPT = activeBlockOf({
  files: [
    'blocks/contexts/languages/typescript/typescript.md',
  ],
  globs: [
    '**/*.ts',
  ],
  id: 'typescript',
});
const STATE = sessionStateOf({
  active: [
    UI,
    TYPESCRIPT,
  ],
  musts: [
    {
      block: 'ui',
      rule: 'one-screen',
    },
    {
      block: 'api',
      rule: 'versioned',
    },
    {
      block: 'ui',
      rule: 'labelled (MAY in web)',
    },
  ],
});
const UI_NOTE =
  'ui governs src/ui/a.ts: read blocks/domains/ui/ui.md blocks/domains/ui/foundation/ui.md; its MUST rules: one-screen, labelled (MAY in web).';
const TYPESCRIPT_NOTE =
  'typescript governs src/ui/a.ts: read blocks/contexts/languages/typescript/typescript.md.';

// The note "x governs a: read <file>." takes 300 bytes with a file of 281.
const NOTE_START = 'x governs a: read ';
const FULL_FILE = 'f'.repeat(281);
const LONG_FILE = 'f'.repeat(282);
const WIDE_FILE = `\uFFFDg${'é'.repeat(200)}`;

describe('remindFile', () => {
  it.each([
    {
      condition: 'the path is absolute',
      path: '/work/project/src/ui/a.ts',
    },
    {
      condition: 'the path starts with ./',
      path: './src/ui/a.ts',
    },
    {
      condition: 'the path is from the project',
      path: 'src/ui/a.ts',
    },
  ])(
    'should name every block that governs the file, with its MUST rules, when $condition',
    ({ path }) => {
      // Arrange
      const sessions = createFakeSessionQueries({
        state: STATE,
      });

      // Act
      const reminder = remindFile({
        agent: '',
        path,
        session: SESSION,
        sessions: sessions,
      });

      // Assert
      expect(reminder).toStrictEqual({
        ids: [
          'ui',
          'typescript',
        ],
        notes: [
          UI_NOTE,
          TYPESCRIPT_NOTE,
        ],
      });
    },
  );

  it.each([
    {
      agent: '',
      condition: 'the session was reminded of one',
      ids: [
        'typescript',
      ],
      notes: [
        TYPESCRIPT_NOTE,
      ],
    },
    {
      agent: 'agent-1',
      condition: 'an agent was reminded of one and its session of the other',
      ids: [
        'ui',
      ],
      notes: [
        UI_NOTE,
      ],
    },
  ])('should leave out the blocks already named when $condition', ({ agent, ids, notes }) => {
    // Arrange
    const sessions = createFakeSessionQueries({
      reminded: [
        {
          agent: undefined,
          ids: [
            'ui',
          ],
        },
        {
          agent: 'agent-1',
          ids: [
            'typescript',
          ],
        },
      ],
      state: STATE,
    });

    // Act
    const reminder = remindFile({
      agent,
      path: 'src/ui/a.ts',
      session: SESSION,
      sessions: sessions,
    });

    // Assert
    expect(reminder).toStrictEqual({
      ids,
      notes,
    });
  });

  it.each([
    {
      condition: 'the note fits its 300 bytes',
      file: FULL_FILE,
      note: `${NOTE_START}${FULL_FILE}.`,
    },
    {
      condition: 'the note is a byte too long',
      file: LONG_FILE,
      note: `${NOTE_START}${'f'.repeat(279)}...`,
    },
    {
      condition: 'the cut falls within a character',
      file: WIDE_FILE,
      note: `${NOTE_START}\uFFFDg${'é'.repeat(137)}...`,
    },
  ])('should cut a note to 300 bytes when $condition', ({ file, note }) => {
    // Arrange
    const sessions = createFakeSessionQueries({
      state: sessionStateOf({
        active: [
          activeBlockOf({
            files: [
              file,
            ],
            id: 'x',
          }),
        ],
      }),
    });

    // Act
    const reminder = remindFile({
      agent: '',
      path: 'a',
      session: SESSION,
      sessions: sessions,
    });

    // Assert
    expect(reminder).toStrictEqual({
      ids: [
        'x',
      ],
      notes: [
        note,
      ],
    });
  });

  it('should name no block when none governs the file', () => {
    // Arrange
    const sessions = createFakeSessionQueries({
      state: STATE,
    });

    // Act
    const reminder = remindFile({
      agent: '',
      path: 'README.md',
      session: SESSION,
      sessions: sessions,
    });

    // Assert
    expect(reminder).toStrictEqual({
      ids: [],
      notes: [],
    });
  });

  it.each([
    {
      agent: '',
      condition: 'the session is not a plain name',
      path: 'src/ui/a.ts',
      session: 'x/y',
      state: STATE,
    },
    {
      agent: '',
      condition: 'the session kept no state',
      path: 'src/ui/a.ts',
      session: 'session-2',
      state: STATE,
    },
    {
      agent: '',
      condition: 'the state names no project',
      path: '/src/ui/a.ts',
      session: SESSION,
      state: sessionStateOf({
        ...STATE,
        project: '',
      }),
    },
    {
      agent: '',
      condition: 'the event names no file',
      path: '',
      session: SESSION,
      state: sessionStateOf({
        active: [
          activeBlockOf({
            id: 'everything',
          }),
        ],
      }),
    },
    {
      agent: '../agent',
      condition: 'the agent is not a plain name',
      path: 'src/ui/a.ts',
      session: SESSION,
      state: STATE,
    },
    {
      agent: '',
      condition: 'no block is active',
      path: 'src/ui/a.ts',
      session: SESSION,
      state: sessionStateOf(),
    },
    {
      agent: '',
      condition: 'the file lies outside the project',
      path: '/work/other/src/ui/a.ts',
      session: SESSION,
      state: STATE,
    },
    {
      agent: '',
      condition: "the file lies in a folder that only starts with the project's name",
      path: '/work/project-two/src/ui/a.ts',
      session: SESSION,
      state: STATE,
    },
  ])('should give no reminder when $condition', ({ agent, path, session, state }) => {
    // Arrange
    const sessions = createFakeSessionQueries({
      states: {
        [SESSION]: state,
        'x/y': state,
      },
    });

    // Act
    const reminder = remindFile({
      agent,
      path,
      session,
      sessions: sessions,
    });

    // Assert
    expect(reminder).toBeUndefined();
  });
});
