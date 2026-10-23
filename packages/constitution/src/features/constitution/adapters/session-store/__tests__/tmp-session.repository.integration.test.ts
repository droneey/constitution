import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import type { SessionState } from '../../../domain/entities';
import { SessionMark } from '../../../domain/entities';
import { createTmpSessionRepositories } from '../tmp-session.repository';

type TmpSessions = ReturnType<typeof createTmpSessionRepositories>;

const SESSION = 'session-1';
const AGENT = 'agent-7';

let folder = '';

const sessionFolder = (): string => join(folder, SESSION);

const namesOf = (path: string): readonly string[] => readdirSync(path).toSorted();

const STATE: SessionState = {
  active: [
    {
      app: '',
      files: [
        'blocks/core/core.md',
      ],
      globs: [
        '**/*.ts',
        '**/*.md',
      ],
      id: 'core',
      scope: 0,
    },
    {
      app: 'web',
      files: [],
      globs: [],
      id: 'ui',
      scope: 1,
    },
  ],
  check: 'bun run check',
  musts: [
    {
      block: 'core',
      rule: 'case-named-should-when',
    },
    {
      block: 'ui',
      rule: 'screen-reads-aloud (lowered)',
    },
  ],
  project: '/work',
};

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'tmp-session-'));
});

afterEach(() => {
  rmSync(folder, {
    force: true,
    recursive: true,
  });
});

describe('createTmpSessionRepositories', () => {
  it.each([
    {
      condition: 'it names a check',
      state: STATE,
      text: [
        'project\t/work',
        'must\tcore\tcase-named-should-when',
        'must\tui\tscreen-reads-aloud (lowered)',
        'check\tbun run check',
        'active\t0\t\tcore\t**/*.ts **/*.md\tblocks/core/core.md',
        'active\t1\tweb\tui\t\t',
        '',
      ].join('\n'),
    },
    {
      condition: 'it has no check',
      state: {
        active: [],
        musts: [],
        project: '/work',
      },
      text: 'project\t/work\n',
    },
  ])(
    'should write one record to a line, whole, when a state that $condition is saved',
    ({ state, text }) => {
      // Arrange
      const sessions = createTmpSessionRepositories({
        folder,
      });

      // Act
      sessions.commands.saveState({
        isReminderKept: false,
        session: SESSION,
        state,
      });

      // Assert
      expect({
        names: namesOf(sessionFolder()),
        written: readFileSync(join(sessionFolder(), 'active.tsv'), 'utf8'),
      }).toStrictEqual({
        names: [
          'active.tsv',
          'reminded',
        ],
        written: text,
      });
    },
  );

  it('should read back the state it saved when the session asks for it', () => {
    // Arrange
    const sessions = createTmpSessionRepositories({
      folder,
    });
    sessions.commands.saveState({
      isReminderKept: false,
      session: SESSION,
      state: STATE,
    });

    // Act
    const state = sessions.queries.state(SESSION);

    // Assert
    expect(state).toStrictEqual(STATE);
  });

  it.each([
    {
      condition: 'its fields are left out',
      expected: {
        active: [
          {
            app: '',
            files: [],
            globs: [],
            id: '',
            scope: 0,
          },
        ],
        check: '',
        musts: [
          {
            block: '',
            rule: '',
          },
        ],
        project: '',
      },
      text: 'project\nmust\ncheck\nactive\n',
    },
    {
      condition: 'records repeat, words are split by several spaces and a record is unknown',
      expected: {
        active: [
          {
            app: 'web',
            files: [
              'a.md',
              'b.md',
            ],
            globs: [
              '**/ui/**',
              '**/web/**',
            ],
            id: 'ui',
            scope: 2,
          },
        ],
        check: 'first',
        musts: [
          {
            block: 'core',
            rule: 'one',
          },
        ],
        project: '/first',
      },
      text: 'project\t/first\nproject\t/second\nnote\tx\ncheck\tfirst\ncheck\tsecond\nmust\tcore\tone\nactive\t2\tweb\tui\t **/ui/**  **/web/** \ta.md  b.md\n',
    },
    {
      condition: 'it holds no record',
      expected: {
        active: [],
        musts: [],
        project: '',
      },
      text: '',
    },
  ])(
    'should read a record as its fields, a missing one as empty, when $condition',
    ({ expected, text }) => {
      // Arrange
      mkdirSync(sessionFolder());
      writeFileSync(join(sessionFolder(), 'active.tsv'), text);
      const sessions = createTmpSessionRepositories({
        folder,
      });

      // Act
      const state = sessions.queries.state(SESSION);

      // Assert
      expect(state).toStrictEqual(expected);
    },
  );

  it('should give no state when the session saved none', () => {
    // Arrange
    const sessions = createTmpSessionRepositories({
      folder,
    });

    // Act
    const state = sessions.queries.state(SESSION);

    // Assert
    expect(state).toBe(undefined);
  });

  it.each([
    {
      agent: undefined,
      condition: 'the session itself',
      name: 'reminded',
    },
    {
      agent: AGENT,
      condition: 'a subagent',
      name: 'reminded.agent-7',
    },
  ])(
    'should keep the blocks reminded in a list of their own when they are reminded to $condition',
    ({ agent, name }) => {
      // Arrange
      const sessions = createTmpSessionRepositories({
        folder,
      });
      sessions.commands.saveState({
        isReminderKept: false,
        session: SESSION,
        state: STATE,
      });
      sessions.commands.addReminded({
        agent,
        ids: [
          'core',
          'ui',
        ],
        session: SESSION,
      });
      sessions.commands.addReminded({
        agent,
        ids: [
          'api',
        ],
        session: SESSION,
      });

      // Act
      const reminded = sessions.queries.reminded({
        agent,
        session: SESSION,
      });

      // Assert
      expect({
        file: readFileSync(join(sessionFolder(), name), 'utf8'),
        reminded,
      }).toStrictEqual({
        file: 'core\nui\napi\n',
        reminded: new Set([
          'core',
          'ui',
          'api',
        ]),
      });
    },
  );

  it('should give no block reminded when the list holds only empty lines or is missing', () => {
    // Arrange
    mkdirSync(sessionFolder());
    writeFileSync(join(sessionFolder(), 'reminded'), '\n\n');
    const sessions = createTmpSessionRepositories({
      folder,
    });

    // Act
    const reminded = {
      main: sessions.queries.reminded({
        agent: undefined,
        session: SESSION,
      }),
      subagent: sessions.queries.reminded({
        agent: AGENT,
        session: SESSION,
      }),
    };

    // Assert
    expect(reminded).toStrictEqual({
      main: new Set(),
      subagent: new Set(),
    });
  });

  it.each([
    {
      condition: 'the session resumes and keeps them',
      expected: {
        main: 'core\n',
        names: [
          'active.tsv',
          'reminded',
          'reminded.agent-7',
          'turn',
        ],
      },
      isReminderKept: true,
    },
    {
      condition: 'the session starts anew',
      expected: {
        main: '',
        names: [
          'active.tsv',
          'reminded',
          'turn',
        ],
      },
      isReminderKept: false,
    },
  ])('should keep or clear the reminded lists when $condition', ({ expected, isReminderKept }) => {
    // Arrange
    const sessions = createTmpSessionRepositories({
      folder,
    });
    sessions.commands.saveState({
      isReminderKept: false,
      session: SESSION,
      state: STATE,
    });
    sessions.commands.addReminded({
      agent: undefined,
      ids: [
        'core',
      ],
      session: SESSION,
    });
    sessions.commands.addReminded({
      agent: AGENT,
      ids: [
        'ui',
      ],
      session: SESSION,
    });
    sessions.commands.recordMark({
      mark: SessionMark.Turn,
      session: SESSION,
      value: 'abc',
    });

    // Act
    sessions.commands.saveState({
      isReminderKept,
      session: SESSION,
      state: STATE,
    });

    // Assert
    expect({
      main: readFileSync(join(sessionFolder(), 'reminded'), 'utf8'),
      names: namesOf(sessionFolder()),
    }).toStrictEqual(expected);
  });

  it('should write a mark whole, as its own file ending in a line break, when a mark is recorded', () => {
    // Arrange
    const sessions = createTmpSessionRepositories({
      folder,
    });
    sessions.commands.saveState({
      isReminderKept: false,
      session: SESSION,
      state: STATE,
    });

    // Act
    sessions.commands.recordMark({
      mark: SessionMark.Checked,
      session: SESSION,
      value: 'f00d',
    });

    // Assert
    expect({
      names: namesOf(sessionFolder()),
      written: readFileSync(join(sessionFolder(), 'checked'), 'utf8'),
    }).toStrictEqual({
      names: [
        'active.tsv',
        'checked',
        'reminded',
      ],
      written: 'f00d\n',
    });
  });

  it.each([
    {
      condition: 'it ends in several line breaks',
      expected: 'f00d',
      text: 'f00d\n\n',
    },
    {
      condition: 'it holds a line break inside',
      expected: 'f0\n0d',
      text: 'f0\n0d\n',
    },
    {
      condition: 'it ends in none',
      expected: 'f00d',
      text: 'f00d',
    },
  ])('should read a mark without its closing line breaks when $condition', ({ expected, text }) => {
    // Arrange
    mkdirSync(sessionFolder());
    writeFileSync(join(sessionFolder(), 'blocked'), text);
    const sessions = createTmpSessionRepositories({
      folder,
    });

    // Act
    const mark = sessions.queries.mark({
      mark: SessionMark.Blocked,
      session: SESSION,
    });

    // Assert
    expect(mark).toBe(expected);
  });

  it('should give no mark when the session recorded none', () => {
    // Arrange
    const sessions = createTmpSessionRepositories({
      folder,
    });

    // Act
    const mark = sessions.queries.mark({
      mark: SessionMark.Reviewed,
      session: SESSION,
    });

    // Assert
    expect(mark).toBe(undefined);
  });

  it.each([
    {
      condition: 'a state is saved',
      write: (sessions: TmpSessions): void => {
        sessions.commands.saveState({
          isReminderKept: false,
          session: SESSION,
          state: STATE,
        });
      },
    },
    {
      condition: 'a mark is recorded',
      write: (sessions: TmpSessions): void => {
        sessions.commands.recordMark({
          mark: SessionMark.Turn,
          session: SESSION,
          value: 'abc',
        });
      },
    },
    {
      condition: 'blocks are reminded',
      write: (sessions: TmpSessions): void => {
        sessions.commands.addReminded({
          agent: undefined,
          ids: [
            'core',
          ],
          session: SESSION,
        });
      },
    },
  ])(
    'should drop the write and leave nothing when $condition but the folder of the sessions is a file',
    ({ write }) => {
      // Arrange
      writeFileSync(join(folder, 'sessions'), '');
      const sessions = createTmpSessionRepositories({
        folder: join(folder, 'sessions'),
      });

      // Act
      write(sessions);

      // Assert
      expect(namesOf(folder)).toStrictEqual([
        'sessions',
      ]);
    },
  );
});
