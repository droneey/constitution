import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { AbsolutePath, BlockId } from '#/kernel/value-objects';

import { activeBlockOf, keptSession, sessionStateOf } from '../../../__tests__/session.fixtures';
import { runSessionRepositorySuite } from '../../../__tests__/session-repository.suite';
import { SessionMark } from '../../../domain/entities';
import { AgentId, TreeFingerprint } from '../../../domain/value-objects';
import type { StateEnvironment, StateFolderWarning } from '../state-folder.utils';
import { StateFolderProblem } from '../state-folder.utils';
import { createXdgSessionRepository } from '../xdg-session.repository';

type XdgSessions = ReturnType<typeof createXdgSessionRepository>;
type XdgSessionsInput = Parameters<typeof createXdgSessionRepository>[0];

const keptAgent = AgentId.create('agent-7');
const startedAt = Temporal.Instant.from('2026-06-15T00:00:00Z');
const SECONDS_IN_A_DAY = 86_400;
const user = process.geteuid?.();

// XDG_STATE_HOME of every case that names no other
let folder = '';
let warnings: StateFolderWarning[] = [];

const programFolder = (): string => join(folder, 'droneey-constitution');

const sessionsFolder = (): string => join(programFolder(), 'sessions');

const sessionFolder = (): string => join(sessionsFolder(), keptSession);

const formerFolder = (): string => join(folder, 'former');

const environmentOf = (input: { home?: string; state?: string }): StateEnvironment =>
  Object.fromEntries([
    [
      'HOME',
      input.home,
    ],
    [
      'XDG_STATE_HOME',
      input.state,
    ],
  ]);

const repositoryOf = (overrides: Partial<XdgSessionsInput> = {}): XdgSessions =>
  createXdgSessionRepository({
    environment: environmentOf({
      state: folder,
    }),
    formerFolder: formerFolder(),
    maxSessions: 10,
    now: () => startedAt,
    owner: user,
    warn: (warning: StateFolderWarning): void => {
      warnings.push(warning);
    },
    ...overrides,
  });

const modeOf = (path: string): number => lstatSync(path).mode & 0o777;

const changedBefore = (input: { days: number; path: string; seconds?: number }): void => {
  const at =
    startedAt.epochMilliseconds / 1000 - input.days * SECONDS_IN_A_DAY - (input.seconds ?? 0);

  utimesSync(input.path, at, at);
};

const namesOf = (path: string): readonly string[] => readdirSync(path).toSorted();

const savedState = sessionStateOf({
  active: [
    activeBlockOf({
      id: 'core',
    }),
  ],
  repositoryFolderPath: AbsolutePath.create('/work'),
});

const staleSession = (name: string): void => {
  mkdirSync(join(sessionsFolder(), name), {
    recursive: true,
  });
  changedBefore({
    days: 31,
    path: join(sessionsFolder(), name),
  });
};

beforeEach(() => {
  folder = realpathSync(mkdtempSync(join(tmpdir(), 'xdg-session-')));
  warnings = [];
});

// A case may leave a folder closed to its user, as a store that failed to open it would; it is
// opened again so the state home can be removed.
const closedFolders = (): readonly string[] => [
  join(folder, 'home', '.local', 'state', 'droneey-constitution'),
  join(folder, 'home', '.local', 'state', 'droneey-constitution', 'sessions'),
];

afterEach(() => {
  for (const closed of closedFolders().filter((path) => existsSync(path))) {
    chmodSync(closed, 0o700);
  }

  rmSync(folder, {
    force: true,
    recursive: true,
  });
});

describe('createXdgSessionRepository', () => {
  it.each([
    {
      condition: 'is no JSON',
      text: '{"repositoryFolderPath":"/work",',
    },
    {
      condition: 'names no status',
      text: '{"repositoryFolderPath":"/work"}',
    },
    {
      condition: 'holds a key the state has not',
      text: '{"repositoryFolderPath":"/work","status":"unparsed","check":"bun run check"}',
    },
    {
      condition: 'names a project by a path that is not absolute',
      text: '{"repositoryFolderPath":"work","status":"unparsed"}',
    },
    {
      condition: 'names a block by no block id',
      text: '{"active":[{"files":[],"governs":[],"id":"Bad_Block","unit":""}],"musts":[],"repositoryFolderPath":"/work","status":"parsed"}',
    },
    {
      condition: 'gives a block a glob whose braces do not pair',
      text: '{"active":[{"files":[],"governs":["{a,b"],"id":"ui","unit":""}],"musts":[],"repositoryFolderPath":"/work","status":"parsed"}',
    },
    {
      condition: 'lowers a rule to MUST',
      text: '{"active":[],"musts":[{"block":"ui","lowerings":[{"level":"MUST","unit":""}],"slug":"screen-reads-aloud"}],"repositoryFolderPath":"/work","status":"parsed"}',
    },
  ])('should give no state when the saved file $condition', ({ text }) => {
    // Arrange
    mkdirSync(sessionFolder(), {
      recursive: true,
    });
    writeFileSync(join(sessionFolder(), 'state.json'), text);

    const sessions = repositoryOf();

    // Act
    const state = sessions.state(keptSession);

    // Assert
    expect(state).toBeUndefined();
  });

  it.each<{
    asker: {
      agent: AgentId | undefined;
    };
    condition: string;
    name: string;
  }>([
    {
      asker: {
        agent: undefined,
      },
      condition: 'the session itself',
      name: 'reminded',
    },
    {
      asker: {
        agent: keptAgent,
      },
      condition: 'a subagent',
      name: 'reminded.agent-7',
    },
  ])(
    'should keep the blocks reminded in a list of their own when they are reminded to $condition',
    ({ asker, name }) => {
      // Arrange
      const sessions = repositoryOf();

      sessions.saveState({
        isReminderKept: false,
        session: keptSession,
        state: savedState,
      });
      sessions.addReminded({
        ...asker,
        ids: [
          BlockId.create('core'),
          BlockId.create('ui'),
        ],
        session: keptSession,
      });
      sessions.addReminded({
        ...asker,
        ids: [
          BlockId.create('api'),
        ],
        session: keptSession,
      });

      // Act
      const reminded = sessions.reminded({
        ...asker,
        session: keptSession,
      });

      // Assert
      expect({
        file: readFileSync(join(sessionFolder(), name), 'utf8'),
        reminded,
      }).toStrictEqual({
        file: 'core\nui\napi\n',
        reminded: new Set([
          BlockId.create('core'),
          BlockId.create('ui'),
          BlockId.create('api'),
        ]),
      });
    },
  );

  it('should give no block reminded when the list holds only empty lines or is missing', () => {
    // Arrange
    mkdirSync(sessionFolder(), {
      recursive: true,
    });
    writeFileSync(join(sessionFolder(), 'reminded'), '\n\n');

    const sessions = repositoryOf();

    // Act
    const reminded = {
      main: sessions.reminded({
        agent: undefined,
        session: keptSession,
      }),
      subagent: sessions.reminded({
        agent: keptAgent,
        session: keptSession,
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
          'reminded',
          'reminded.agent-7',
          'state.json',
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
          'reminded',
          'state.json',
          'turn',
        ],
      },
      isReminderKept: false,
    },
  ])('should keep or clear the reminded lists when $condition', ({ expected, isReminderKept }) => {
    // Arrange
    const sessions = repositoryOf();

    sessions.saveState({
      isReminderKept: false,
      session: keptSession,
      state: savedState,
    });
    sessions.addReminded({
      agent: undefined,
      ids: [
        BlockId.create('core'),
      ],
      session: keptSession,
    });
    sessions.addReminded({
      agent: keptAgent,
      ids: [
        BlockId.create('ui'),
      ],
      session: keptSession,
    });
    sessions.recordFingerprint({
      fingerprint: TreeFingerprint.create('abc'),
      mark: SessionMark.Turn,
      session: keptSession,
    });

    // Act
    sessions.saveState({
      isReminderKept,
      session: keptSession,
      state: savedState,
    });

    // Assert
    expect({
      main: readFileSync(join(sessionFolder(), 'reminded'), 'utf8'),
      names: namesOf(sessionFolder()),
    }).toStrictEqual(expected);
  });

  it('should write a mark whole, as its own file ending in a line break, when a mark is recorded', () => {
    // Arrange
    const sessions = repositoryOf();

    sessions.saveState({
      isReminderKept: false,
      session: keptSession,
      state: savedState,
    });

    // Act
    sessions.recordFingerprint({
      fingerprint: TreeFingerprint.create('f00d'),
      mark: SessionMark.Checked,
      session: keptSession,
    });

    // Assert
    expect({
      names: namesOf(sessionFolder()),
      written: readFileSync(join(sessionFolder(), 'checked'), 'utf8'),
    }).toStrictEqual({
      names: [
        'checked',
        'reminded',
        'state.json',
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
  ])(
    'should read a reason without its closing line breaks when $condition',
    ({ expected, text }) => {
      // Arrange
      mkdirSync(sessionFolder(), {
        recursive: true,
      });
      writeFileSync(join(sessionFolder(), SessionMark.Unjudged), text);

      const sessions = repositoryOf();

      // Act
      const reason = sessions.unjudged(keptSession);

      // Assert
      expect(reason).toBe(expected);
    },
  );

  it.each([
    {
      condition: 'it ends in a line break',
      expected: 'f00d',
      text: 'f00d\n',
    },
    {
      condition: 'it holds a line break inside',
      expected: undefined,
      text: 'f0\n0d\n',
    },
    {
      condition: 'it is empty',
      expected: undefined,
      text: '',
    },
  ])(
    'should read a fingerprint only when its file holds one line and $condition',
    ({ expected, text }) => {
      // Arrange
      mkdirSync(sessionFolder(), {
        recursive: true,
      });
      writeFileSync(join(sessionFolder(), SessionMark.Blocked), text);

      const sessions = repositoryOf();

      // Act
      const fingerprint = sessions.fingerprint({
        mark: SessionMark.Blocked,
        session: keptSession,
      });

      // Assert
      expect<string | undefined>(fingerprint).toBe(expected);
    },
  );

  it.each([
    {
      condition: 'a state is saved',
      write: (sessions: XdgSessions): void => {
        sessions.saveState({
          isReminderKept: false,
          session: keptSession,
          state: savedState,
        });
      },
    },
    {
      condition: 'a mark is recorded',
      write: (sessions: XdgSessions): void => {
        sessions.recordFingerprint({
          fingerprint: TreeFingerprint.create('abc'),
          mark: SessionMark.Turn,
          session: keptSession,
        });
      },
    },
    {
      condition: 'blocks are reminded',
      write: (sessions: XdgSessions): void => {
        sessions.addReminded({
          agent: undefined,
          ids: [
            BlockId.create('core'),
          ],
          session: keptSession,
        });
      },
    },
  ])(
    "should drop the write, and warn of nothing, when $condition but the session's place holds a file",
    ({ write }) => {
      // Arrange
      mkdirSync(sessionsFolder(), {
        recursive: true,
      });
      writeFileSync(sessionFolder(), '');

      const sessions = repositoryOf();

      // Act
      write(sessions);

      // Assert
      expect({
        held: readFileSync(sessionFolder(), 'utf8'),
        names: namesOf(sessionsFolder()),
        warnings,
      }).toStrictEqual({
        held: '',
        names: [
          keptSession,
        ],
        warnings: [],
      });
    },
  );
});

describe('createXdgSessionRepository: where the sessions live', () => {
  it.each([
    {
      condition: 'XDG_STATE_HOME names an absolute folder',
      environment: (home: string): StateEnvironment =>
        environmentOf({
          home: join(home, 'home'),
          state: join(home, 'state'),
        }),
      expected: [
        'state',
        'droneey-constitution',
        'sessions',
      ],
    },
    {
      condition: 'XDG_STATE_HOME is empty',
      environment: (home: string): StateEnvironment =>
        environmentOf({
          home: join(home, 'home'),
          state: '',
        }),
      expected: [
        'home',
        '.local',
        'state',
        'droneey-constitution',
        'sessions',
      ],
    },
    {
      condition: 'XDG_STATE_HOME is relative',
      environment: (home: string): StateEnvironment =>
        environmentOf({
          home: join(home, 'home'),
          state: 'state',
        }),
      expected: [
        'home',
        '.local',
        'state',
        'droneey-constitution',
        'sessions',
      ],
    },
  ])(
    'should keep a session in its own folder of the state home when $condition',
    ({ environment, expected }) => {
      // Arrange
      const sessions = repositoryOf({
        environment: environment(folder),
      });

      // Act
      sessions.saveState({
        isReminderKept: false,
        session: keptSession,
        state: savedState,
      });

      // Assert
      expect(namesOf(join(folder, ...expected, keptSession))).toStrictEqual([
        'reminded',
        'state.json',
      ]);
    },
  );

  it.each<{
    arrange: (program: string) => void;
    condition: string;
  }>([
    {
      arrange: () => undefined,
      condition: 'the folders are made anew',
    },
    {
      arrange: (program: string) => {
        mkdirSync(join(program, 'sessions'), {
          recursive: true,
        });
        chmodSync(join(program, 'sessions'), 0o755);
        chmodSync(program, 0o755);
      },
      condition: 'the folders exist open to others',
    },
    {
      arrange: (program: string) => {
        mkdirSync(join(program, 'sessions'), {
          recursive: true,
        });
        chmodSync(join(program, 'sessions'), 0o500);
        chmodSync(program, 0o500);
      },
      condition: 'the folders exist closed to their user',
    },
  ])('should keep every folder and file of the sessions private when $condition', ({ arrange }) => {
    // Arrange
    const home = join(folder, 'home');
    const program = join(home, '.local', 'state', 'droneey-constitution');
    const session = join(program, 'sessions', keptSession);

    arrange(program);

    const sessions = repositoryOf({
      environment: environmentOf({
        home,
      }),
    });

    sessions.saveState({
      isReminderKept: false,
      session: keptSession,
      state: savedState,
    });
    sessions.recordFingerprint({
      fingerprint: TreeFingerprint.create('abc'),
      mark: SessionMark.Turn,
      session: keptSession,
    });

    // Act
    sessions.addReminded({
      agent: keptAgent,
      ids: [
        BlockId.create('ui'),
      ],
      session: keptSession,
    });

    // Assert
    expect({
      active: modeOf(join(session, 'state.json')),
      program: modeOf(program),
      reminded: modeOf(join(session, 'reminded')),
      remindedToAgent: modeOf(join(session, 'reminded.agent-7')),
      session: modeOf(session),
      sessions: modeOf(join(program, 'sessions')),
      turn: modeOf(join(session, 'turn')),
    }).toStrictEqual({
      active: 0o600,
      program: 0o700,
      reminded: 0o600,
      remindedToAgent: 0o600,
      session: 0o700,
      sessions: 0o700,
      turn: 0o600,
    });
  });

  it('should make the state home private when it makes it', () => {
    // Arrange
    const home = join(folder, 'home');
    const sessions = repositoryOf({
      environment: environmentOf({
        home,
      }),
    });

    // Act
    sessions.state(keptSession);

    // Assert
    expect([
      modeOf(join(home, '.local')),
      modeOf(join(home, '.local', 'state')),
    ]).toStrictEqual([
      0o700,
      0o700,
    ]);
  });
});

describe('createXdgSessionRepository: no folder to keep the sessions in', () => {
  it.each<{
    arrange: () => void;
    condition: string;
    input: () => Partial<XdgSessionsInput>;
    warning: () => StateFolderWarning;
  }>([
    {
      arrange: () => undefined,
      condition: 'neither XDG_STATE_HOME nor HOME is set',
      input: () => ({
        environment: environmentOf({}),
      }),
      warning: () => ({
        code: StateFolderProblem.Unnamed,
      }),
    },
    {
      arrange: () => undefined,
      condition: 'XDG_STATE_HOME and HOME are relative',
      input: () => ({
        environment: environmentOf({
          home: 'home',
          state: 'state',
        }),
      }),
      warning: () => ({
        code: StateFolderProblem.Unnamed,
      }),
    },
    {
      arrange: () => {
        writeFileSync(join(folder, 'home'), '');
      },
      condition: 'the state home is a file',
      input: () => ({
        environment: environmentOf({
          state: join(folder, 'home'),
        }),
      }),
      warning: () => ({
        code: StateFolderProblem.Unwritable,
        folder: join(folder, 'home', 'droneey-constitution', 'sessions'),
      }),
    },
    {
      arrange: () => {
        mkdirSync(join(folder, 'elsewhere'));
        symlinkSync(join(folder, 'elsewhere'), programFolder());
      },
      condition: "the program's folder is a link",
      input: () => ({}),
      warning: () => ({
        code: StateFolderProblem.Unsafe,
        folder: programFolder(),
      }),
    },
    {
      arrange: () => {
        mkdirSync(join(folder, 'elsewhere'));
        mkdirSync(programFolder());
        symlinkSync(join(folder, 'elsewhere'), sessionsFolder());
      },
      condition: 'the folder of the sessions is a link',
      input: () => ({}),
      warning: () => ({
        code: StateFolderProblem.Unsafe,
        folder: sessionsFolder(),
      }),
    },
    {
      arrange: () => undefined,
      condition: 'another user owns the folders',
      input: () => ({
        owner: (user ?? 0) + 1,
      }),
      warning: () => ({
        code: StateFolderProblem.Unsafe,
        folder: programFolder(),
      }),
    },
    {
      arrange: () => undefined,
      condition: 'the system names no user',
      input: () => ({
        owner: undefined,
      }),
      warning: () => ({
        code: StateFolderProblem.Unsafe,
        folder: programFolder(),
      }),
    },
  ])('should keep nothing and warn once when $condition', ({ arrange, input, warning }) => {
    // Arrange
    arrange();

    const sessions = repositoryOf(input());

    sessions.saveState({
      isReminderKept: false,
      session: keptSession,
      state: savedState,
    });
    sessions.recordFingerprint({
      fingerprint: TreeFingerprint.create('abc'),
      mark: SessionMark.Turn,
      session: keptSession,
    });
    sessions.addReminded({
      agent: undefined,
      ids: [
        BlockId.create('core'),
      ],
      session: keptSession,
    });

    // Act
    const seen = {
      mark: sessions.fingerprint({
        mark: SessionMark.Turn,
        session: keptSession,
      }),
      reminded: sessions.reminded({
        agent: undefined,
        session: keptSession,
      }),
      state: sessions.state(keptSession),
    };

    // Assert
    expect({
      elsewhere: existsSync(join(folder, 'elsewhere', keptSession)),
      seen,
      warnings,
    }).toStrictEqual({
      elsewhere: false,
      seen: {
        mark: undefined,
        reminded: new Set(),
        state: undefined,
      },
      warnings: [
        warning(),
      ],
    });
  });
});

describe('createXdgSessionRepository: links in place of its files', () => {
  it.each([
    {
      condition: 'the state',
      name: 'state.json',
      expected: undefined,
      read: (sessions: XdgSessions): unknown => sessions.state(keptSession),
      text: '{"repositoryFolderPath":"/elsewhere","status":"unparsed"}',
    },
    {
      condition: 'a mark',
      expected: undefined,
      name: 'turn',
      read: (sessions: XdgSessions): unknown =>
        sessions.fingerprint({
          mark: SessionMark.Turn,
          session: keptSession,
        }),
      text: 'forged\n',
    },
    {
      condition: 'the blocks reminded',
      expected: new Set(),
      name: 'reminded',
      read: (sessions: XdgSessions): unknown =>
        sessions.reminded({
          agent: undefined,
          session: keptSession,
        }),
      text: 'core\n',
    },
  ])(
    'should read nothing through a link in place of $condition',
    ({ expected, name, read, text }) => {
      // Arrange
      const outside = join(folder, 'outside');

      writeFileSync(outside, text);
      mkdirSync(sessionFolder(), {
        recursive: true,
      });
      symlinkSync(outside, join(sessionFolder(), name));

      const sessions = repositoryOf();

      // Act
      const seen = read(sessions);

      // Assert
      expect(seen).toStrictEqual(expected);
    },
  );

  it.each([
    {
      condition: 'a mark',
      name: 'turn',
      write: (sessions: XdgSessions): void => {
        sessions.recordFingerprint({
          fingerprint: TreeFingerprint.create('abc'),
          mark: SessionMark.Turn,
          session: keptSession,
        });
      },
    },
    {
      condition: 'the blocks reminded to an agent',
      name: 'reminded.agent-7',
      write: (sessions: XdgSessions): void => {
        sessions.addReminded({
          agent: keptAgent,
          ids: [
            BlockId.create('core'),
          ],
          session: keptSession,
        });
      },
    },
  ])('should write nothing through a link in place of $condition', ({ name, write }) => {
    // Arrange
    const outside = join(folder, 'outside');
    const sessions = repositoryOf();

    sessions.saveState({
      isReminderKept: false,
      session: keptSession,
      state: savedState,
    });

    writeFileSync(outside, 'kept\n');
    symlinkSync(outside, join(sessionFolder(), name));

    // Act
    write(sessions);

    // Assert
    expect(readFileSync(outside, 'utf8')).toBe('kept\n');
  });
});

describe('createXdgSessionRepository: what a start removes', () => {
  it.each([
    {
      condition: 'unchanged for longer than 30 days',
      days: 30,
      isKept: false,
      seconds: 1,
    },
    {
      condition: 'unchanged for 30 days exactly',
      days: 30,
      isKept: true,
      seconds: 0,
    },
    {
      condition: 'changed within 30 days',
      days: 29,
      isKept: true,
      seconds: 0,
    },
  ])('should keep another session only while it is not $condition', ({ days, isKept, seconds }) => {
    // Arrange
    const other = join(sessionsFolder(), 'session-2');

    mkdirSync(other, {
      recursive: true,
    });
    writeFileSync(
      join(other, 'state.json'),
      '{"repositoryFolderPath":"/work","status":"unparsed"}',
    );
    changedBefore({
      days,
      path: other,
      seconds,
    });

    const sessions = repositoryOf();

    // Act
    sessions.saveState({
      isReminderKept: false,
      session: keptSession,
      state: savedState,
    });

    // Assert
    expect(existsSync(other)).toBe(isKept);
  });

  it('should look at no more sessions than its limit when a session starts', () => {
    // Arrange
    staleSession('session-2');
    staleSession('session-3');
    staleSession('session-4');

    const sessions = repositoryOf({
      maxSessions: 2,
    });

    // Act
    sessions.saveState({
      isReminderKept: false,
      session: keptSession,
      state: savedState,
    });

    // Assert
    expect(namesOf(sessionsFolder()).length).toBe(2);
  });

  it.each<{
    arrange: () => void;
    condition: string;
    input: () => Partial<XdgSessionsInput>;
    isKept: boolean;
  }>([
    {
      arrange: () => {
        mkdirSync(join(formerFolder(), 'session-0'), {
          recursive: true,
        });
      },
      condition: 'it is a folder of the user',
      input: () => ({}),
      isKept: false,
    },
    {
      arrange: () => {
        mkdirSync(join(folder, 'elsewhere', 'session-0'), {
          recursive: true,
        });
        symlinkSync(join(folder, 'elsewhere'), formerFolder());
      },
      condition: 'it is a link',
      input: () => ({}),
      isKept: true,
    },
    {
      arrange: () => {
        mkdirSync(join(formerFolder(), 'session-0'), {
          recursive: true,
        });
      },
      condition: 'it is no folder of the user',
      input: () => ({
        owner: (user ?? 0) + 1,
      }),
      isKept: true,
    },
  ])(
    'should remove the folder an earlier release kept the sessions in only when $condition',
    ({ arrange, input, isKept }) => {
      // Arrange
      arrange();

      const sessions = repositoryOf(input());

      // Act
      sessions.saveState({
        isReminderKept: false,
        session: keptSession,
        state: savedState,
      });

      // Assert
      expect(existsSync(join(formerFolder(), 'session-0'))).toBe(isKept);
    },
  );
});

describe('createXdgSessionRepository: the files it opens', () => {
  it.each([
    {
      condition: 'reads a state',
      use: (sessions: XdgSessions): void => {
        sessions.state(keptSession);
      },
    },
    {
      condition: 'records a mark',
      use: (sessions: XdgSessions): void => {
        sessions.recordFingerprint({
          fingerprint: TreeFingerprint.create('abc'),
          mark: SessionMark.Turn,
          session: keptSession,
        });
      },
    },
  ])('should hold no file open once it $condition', ({ use }) => {
    // Arrange
    const sessions = repositoryOf();

    sessions.saveState({
      isReminderKept: false,
      session: keptSession,
      state: savedState,
    });

    const open = readdirSync('/dev/fd').length;

    // Act
    use(sessions);

    // Assert
    expect(readdirSync('/dev/fd').length).toBe(open);
  });
});

runSessionRepositorySuite({
  name: 'createXdgSessionRepository',
  repositoryOf: () => repositoryOf(),
});
