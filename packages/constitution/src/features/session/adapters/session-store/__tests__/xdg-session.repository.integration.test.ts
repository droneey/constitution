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

import { Level } from '#/kernel/constants';
import type { Lowering } from '#/kernel/entities';
import { AbsolutePath, BlockId, RuleSlug, UnitPath } from '#/kernel/value-objects';

import { runGateCommandRepositorySuite } from '../../../__tests__/gate-command-repository.suite';
import { keptBlockOf, keptSession, sessionStateOf } from '../../../__tests__/session.fixtures';
import { runSessionRepositorySuite } from '../../../__tests__/session-repository.suite';
import type { GatedRule } from '../../../domain/entities';
import { DebtKind, GateEntryKind, SessionAgent, SessionMark } from '../../../domain/entities';
import {
  AgentId,
  RuleHash,
  RuleSetHash,
  SessionId,
  ToolUseId,
  TreeFingerprint,
} from '../../../domain/value-objects';
import type { StateEnvironment, StateFolderWarning } from '../state-folder.utils';
import { StateFolderProblem } from '../state-folder.utils';
import { createXdgSessionRepository } from '../xdg-session.repository';

type XdgSessions = ReturnType<typeof createXdgSessionRepository>;
type XdgSessionsInput = Parameters<typeof createXdgSessionRepository>[0];

const keptAgent = AgentId.create('agent-7');
const startedAt = Temporal.Instant.from('2026-06-15T00:00:00Z');
const SECONDS_IN_A_DAY = 86_400;
const user = process.geteuid?.();

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

const set = RuleSetHash.create('0123456789abcdef');

const gatedRuleOf = (index: number): GatedRule => ({
  file: AbsolutePath.create('/work/blocks/core/foundation/names.md'),
  hash: RuleHash.create(index.toString(16).padStart(16, '0')),
  level: Level.Must,
  slug: RuleSlug.create(`rule-${index}`),
  statement: 'word '.repeat(60).trim(),
  why: 'Readers learn from names.',
});

const rulesOfParts = Array.from(
  {
    length: 400,
  },
  (_, index) => gatedRuleOf(index + 1),
);

const partsFolder = (): string =>
  join(folder, 'project', '.droneey', 'constitution-sessions', keptSession, 'parts');

const inodesOf = (paths: readonly string[]): readonly number[] =>
  paths.map((path) => lstatSync(path).ino);

const writePartsOfManyRules = (sessions: XdgSessions): readonly AbsolutePath[] =>
  sessions.writeParts({
    projectFolderPath: AbsolutePath.create(join(folder, 'project')),
    rules: rulesOfParts,
    session: keptSession,
    set,
  });

const savedState = sessionStateOf({
  active: [
    keptBlockOf({
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

  it('should keep no reason of a lowering in the state it saves', () => {
    // Arrange
    const sessions = repositoryOf();
    const reasonedLowering: Lowering = {
      level: Level.May,
      reason: 'generated screens',
      unit: UnitPath.create(''),
    };

    // Act
    sessions.saveState({
      isReminderKept: false,
      session: keptSession,
      state: sessionStateOf({
        mustsBesideCore: [
          {
            block: BlockId.create('ui'),
            lowerings: [
              reasonedLowering,
            ],
            slug: RuleSlug.create('screen-reads-aloud'),
          },
        ],
      }),
    });

    // Assert
    expect(JSON.parse(readFileSync(join(sessionFolder(), 'state.json'), 'utf8'))).toStrictEqual({
      active: [],
      musts: [
        {
          block: 'ui',
          lowerings: [
            {
              level: 'MAY',
              unit: '',
            },
          ],
          slug: 'screen-reads-aloud',
        },
      ],
      repositoryFolderPath: '/work/project',
      status: 'parsed',
    });
  });

  it.each<{
    asker: {
      agent: SessionAgent;
    };
    condition: string;
    name: string;
  }>([
    {
      asker: {
        agent: SessionAgent.main,
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
        agent: SessionAgent.main,
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
      agent: SessionAgent.main,
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
      writeFileSync(join(sessionFolder(), SessionMark.Reviewed), text);

      const sessions = repositoryOf();

      // Act
      const fingerprint = sessions.fingerprint({
        mark: SessionMark.Reviewed,
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
          agent: SessionAgent.main,
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
      agent: SessionAgent.main,
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
        agent: SessionAgent.main,
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

describe("createXdgSessionRepository: the gate's files", () => {
  it.each<{
    expected: unknown;
    kept: string;
    read: (sessions: XdgSessions) => unknown;
  }>([
    {
      expected: [],
      kept: 'gate entry',
      read: (sessions) =>
        sessions.gateEntries({
          agent: SessionAgent.main,
          session: keptSession,
        }),
    },
    {
      expected: undefined,
      kept: 'tree',
      read: (sessions) =>
        sessions.takeShellTree({
          call: ToolUseId.create('toolu_1'),
          session: keptSession,
        }),
    },
  ])('should keep no $kept when no folder keeps the sessions', ({ expected, read }) => {
    // Arrange
    const sessions = repositoryOf({
      environment: environmentOf({}),
    });

    sessions.addGateEntry({
      agent: SessionAgent.main,
      entry: {
        kind: GateEntryKind.Told,
      },
      session: keptSession,
    });
    sessions.keepShellTree({
      call: ToolUseId.create('toolu_1'),
      session: keptSession,
      tree: {
        fileSignatures: new Map(),
        repositoryFolderPath: AbsolutePath.create('/work'),
      },
    });

    // Act
    const kept = read(sessions);

    // Assert
    expect(kept).toStrictEqual(expected);
  });

  it('should write no part where no folder can be made', () => {
    // Arrange
    const sessions = repositoryOf();

    writeFileSync(join(folder, 'project-file'), '');

    // Act
    const parts = sessions.writeParts({
      projectFolderPath: AbsolutePath.create(join(folder, 'project-file')),
      rules: [
        gatedRuleOf(1),
      ],
      session: keptSession,
      set,
    });

    // Assert
    expect(parts).toStrictEqual([]);
  });

  it('should read past a gate entry of another form', () => {
    // Arrange
    mkdirSync(sessionFolder(), {
      recursive: true,
    });
    writeFileSync(
      join(sessionFolder(), 'gate'),
      [
        '{"key":"not-a-hash","kind":"refused"}',
        '{"kind":"unknown"}',
        'told',
        '{"kind":"told"}',
        '',
      ].join('\n'),
    );

    const sessions = repositoryOf();

    // Act
    const entries = sessions.gateEntries({
      agent: SessionAgent.main,
      session: keptSession,
    });

    // Assert
    expect(entries).toStrictEqual([
      {
        kind: GateEntryKind.Told,
      },
    ]);
  });

  it('should add no line for no debt', () => {
    // Arrange
    const sessions = repositoryOf();

    // Act
    sessions.addDebts({
      agent: keptAgent,
      debts: [],
      session: keptSession,
    });

    // Assert
    expect(existsSync(join(sessionFolder(), `debt.${keptAgent}`))).toBe(false);
  });

  it('should read back a debt whose path holds a line break', () => {
    // Arrange
    const sessions = repositoryOf();
    const debt = {
      kind: DebtKind.Read,
      path: AbsolutePath.create('/work/src/a\nread b.ts'),
    };

    sessions.addDebts({
      agent: keptAgent,
      debts: [
        debt,
      ],
      session: keptSession,
    });

    // Act
    const debts = sessions.debts({
      agent: keptAgent,
      session: keptSession,
    });

    // Assert
    expect(debts).toStrictEqual([
      debt,
    ]);
  });

  it('should remove the file of a tree once it is taken', () => {
    // Arrange
    const sessions = repositoryOf();
    const call = ToolUseId.create('toolu_1');

    sessions.keepShellTree({
      call,
      session: keptSession,
      tree: {
        fileSignatures: new Map(),
        repositoryFolderPath: AbsolutePath.create('/work'),
      },
    });

    // Act
    sessions.takeShellTree({
      call,
      session: keptSession,
    });

    // Assert
    expect(namesOf(sessionFolder())).toStrictEqual([]);
  });

  it('should make the folder of a session whose start it missed private', () => {
    // Arrange
    const sessions = repositoryOf();

    // Act
    sessions.addGateEntry({
      agent: SessionAgent.main,
      entry: {
        kind: GateEntryKind.Told,
      },
      session: keptSession,
    });

    // Assert
    expect(modeOf(sessionFolder())).toBe(0o700);
  });

  it.each([
    {
      add: (sessions: XdgSessions): void => {
        sessions.addRulesRead({
          agent: keptAgent,
          rules: [
            gatedRuleOf(1),
          ],
          session: keptSession,
        });
      },
      list: 'the rules read',
      name: 'rules.agent-7',
    },
    {
      add: (sessions: XdgSessions): void => {
        sessions.addDebts({
          agent: keptAgent,
          debts: [
            {
              kind: DebtKind.Read,
              path: AbsolutePath.create('/work/src/a.ts'),
            },
          ],
          session: keptSession,
        });
      },
      list: 'the debts',
      name: 'debt.agent-7',
    },
    {
      add: (sessions: XdgSessions): void => {
        sessions.addGateEntry({
          agent: keptAgent,
          entry: {
            kind: GateEntryKind.Told,
          },
          session: keptSession,
        });
      },
      list: 'the gate entries',
      name: 'gate.agent-7',
    },
    {
      add: (sessions: XdgSessions): void => {
        sessions.addHotReminded({
          agent: keptAgent,
          paths: [
            AbsolutePath.create('/work/src/a.ts'),
          ],
          session: keptSession,
        });
      },
      list: 'the files reminded of their hot rules',
      name: 'hot.agent-7',
    },
    {
      add: (sessions: XdgSessions): void => {
        sessions.addOwnChanges({
          agent: keptAgent,
          paths: [
            AbsolutePath.create('/work/src/a.ts'),
          ],
          session: keptSession,
        });
      },
      list: 'the own changes',
      name: 'owned.agent-7',
    },
    {
      add: (sessions: XdgSessions): void => {
        sessions.addReviewDebt({
          paths: [
            AbsolutePath.create('/work/src/a.ts'),
          ],
          session: keptSession,
          subagent: keptAgent,
        });
      },
      list: 'the reviews owed',
      name: 'review-debt',
    },
  ])('should keep $list in a file of its own name in the session', ({ add, name }) => {
    // Arrange
    const sessions = repositoryOf();

    // Act
    add(sessions);

    // Assert
    expect(namesOf(sessionFolder())).toStrictEqual([
      name,
    ]);
  });

  it.each<{
    expected: unknown;
    lines: readonly string[];
    list: string;
    name: string;
    read: (sessions: XdgSessions) => unknown;
  }>([
    {
      expected: [],
      lines: [
        '{"kind":"unknown","path":"/work/src/a.ts"}',
        '{"kind":"read","path":"work/src/a.ts"}',
        'read /work/src/a.ts',
      ],
      list: 'the debts',
      name: 'debt.agent-7',
      read: (sessions) =>
        sessions.debts({
          agent: keptAgent,
          session: keptSession,
        }),
    },
    {
      expected: [],
      lines: [
        '{"agent":"bad!agent","path":"/work/src/a.ts"}',
        '{"agent":"agent-7","path":"work/src/a.ts"}',
        'agent-7 /work/src/a.ts',
      ],
      list: 'the reviews owed',
      name: 'review-debt',
      read: (sessions) => sessions.reviewDebt(keptSession),
    },
    {
      expected: new Map(),
      lines: [
        '{"hash":"0123456789abcdef","slug":"Bad_Slug"}',
        '{"hash":"xyz","slug":"rule-1"}',
        'rule-1 0123456789abcdef',
      ],
      list: 'the rules read',
      name: 'rules.agent-7',
      read: (sessions) =>
        sessions.rulesRead({
          agent: keptAgent,
          session: keptSession,
        }),
    },
    {
      expected: new Set(),
      lines: [
        '"work/src/a.ts"',
        '/work/src/a.ts',
      ],
      list: 'the files reminded of their hot rules',
      name: 'hot.agent-7',
      read: (sessions) =>
        sessions.hotReminded({
          agent: keptAgent,
          session: keptSession,
        }),
    },
    {
      expected: [],
      lines: [
        '"work/src/a.ts"',
        '/work/src/a.ts',
      ],
      list: 'the own changes',
      name: 'owned.agent-7',
      read: (sessions) =>
        sessions.ownChanges({
          agent: keptAgent,
          session: keptSession,
        }),
    },
    {
      expected: new Set([
        AbsolutePath.create('/work/src/a.ts'),
      ]),
      lines: [
        '"/work/src/a.ts"',
        '{"mark":"cleared"}',
      ],
      list: 'the files reminded of their hot rules, past a mark of another file',
      name: 'hot.agent-7',
      read: (sessions) =>
        sessions.hotReminded({
          agent: keptAgent,
          session: keptSession,
        }),
    },
  ])('should read past a line of another form in $list', ({ expected, lines, name, read }) => {
    // Arrange
    mkdirSync(sessionFolder(), {
      recursive: true,
    });
    writeFileSync(join(sessionFolder(), name), `${lines.join('\n')}\n`);

    const sessions = repositoryOf();

    // Act
    const held = read(sessions);

    // Assert
    expect(held).toStrictEqual(expected);
  });

  it.each([
    {
      condition: 'it names a part numbered past nine',
      expected: {
        lineCount: 2,
        rules: [
          {
            hash: RuleHash.create('0000000000000001'),
            slug: RuleSlug.create('rule-1'),
          },
        ],
      },
      make: (path: string): void => {
        writeFileSync(path, '<!-- rule rule-1 0000000000000001 -->\n');
      },
      name: `${set}.12.md`,
    },
    {
      condition: 'its name holds more before the set',
      expected: undefined,
      make: (path: string): void => {
        writeFileSync(path, '<!-- rule rule-1 0000000000000001 -->\n');
      },
      name: `x${set}.1.md`,
    },
    {
      condition: 'its name holds more after the extension',
      expected: undefined,
      make: (path: string): void => {
        writeFileSync(path, '<!-- rule rule-1 0000000000000001 -->\n');
      },
      name: `${set}.1.md.bak`,
    },
    {
      condition: 'it is a folder named as a part',
      expected: undefined,
      make: (path: string): void => {
        mkdirSync(path);
      },
      name: `${set}.1.md`,
    },
  ])(
    'should give the rules of a file in the parts folder only as a part when $condition',
    ({ expected, make, name }) => {
      // Arrange
      mkdirSync(partsFolder(), {
        recursive: true,
      });
      make(join(partsFolder(), name));

      const sessions = repositoryOf();

      // Act
      const part = sessions.partOf({
        path: AbsolutePath.create(join(partsFolder(), name)),
        session: keptSession,
      });

      // Assert
      expect(part).toStrictEqual(expected);
    },
  );

  it('should leave the parts of a set as they are when the set is written again', () => {
    // Arrange
    const sessions = repositoryOf();
    const parts = writePartsOfManyRules(sessions);
    const before = inodesOf(parts);

    // Act
    writePartsOfManyRules(sessions);

    // Assert
    expect(inodesOf(parts)).toStrictEqual(before);
  });

  it('should write the parts of a set again when one of them is gone', () => {
    // Arrange
    const sessions = repositoryOf();
    const [, second = ''] = writePartsOfManyRules(sessions);

    rmSync(second);

    // Act
    writePartsOfManyRules(sessions);

    // Assert
    expect(existsSync(second)).toBe(true);
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
          agent: SessionAgent.main,
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

const projectFolder = (name: string): string => join(folder, name);

const sessionPartsIn = (project: string, session: string): string =>
  join(projectFolder(project), '.droneey', 'constitution-sessions', session);

const partsWrittenIn = (input: {
  project: string;
  session: SessionId;
  sessions: XdgSessions;
}): void => {
  input.sessions.writeParts({
    projectFolderPath: AbsolutePath.create(projectFolder(input.project)),
    rules: [
      gatedRuleOf(1),
    ],
    session: input.session,
    set,
  });
};

const staleSessionIn = (name: string): void => {
  mkdirSync(sessionPartsIn('first', name), {
    recursive: true,
  });
  changedBefore({
    days: 2,
    path: sessionPartsIn('first', name),
  });
};

describe('createXdgSessionRepository: what the end of a session removes', () => {
  it("should remove the session's parts in each project it wrote them to, and keep its state, its own changes and another session's parts", () => {
    // Arrange
    const sessions = repositoryOf();
    const other = SessionId.create('session-2');

    sessions.saveState({
      isReminderKept: false,
      session: keptSession,
      state: savedState,
    });
    sessions.addOwnChanges({
      agent: SessionAgent.main,
      paths: [
        AbsolutePath.create('/work/src/a.ts'),
      ],
      session: keptSession,
    });
    partsWrittenIn({
      project: 'first',
      session: keptSession,
      sessions,
    });
    partsWrittenIn({
      project: 'second',
      session: keptSession,
      sessions,
    });
    partsWrittenIn({
      project: 'first',
      session: other,
      sessions,
    });

    // Act
    sessions.removeSessionFolders(keptSession);

    // Assert
    expect({
      first: existsSync(sessionPartsIn('first', keptSession)),
      other: existsSync(sessionPartsIn('first', other)),
      own: sessions.ownChanges({
        agent: SessionAgent.main,
        session: keptSession,
      }),
      second: existsSync(sessionPartsIn('second', keptSession)),
      state: sessions.state(keptSession),
    }).toStrictEqual({
      first: false,
      other: true,
      own: [
        AbsolutePath.create('/work/src/a.ts'),
      ],
      second: false,
      state: savedState,
    });
  });

  it('should remove no part when no folder keeps the sessions', () => {
    // Arrange
    const sessions = repositoryOf({
      environment: environmentOf({}),
    });

    partsWrittenIn({
      project: 'first',
      session: keptSession,
      sessions,
    });

    // Act
    sessions.removeSessionFolders(keptSession);

    // Assert
    expect(existsSync(sessionPartsIn('first', keptSession))).toBe(true);
  });
});

describe("createXdgSessionRepository: what a start sweeps from a project's sessions", () => {
  it.each([
    {
      condition: 'its folder and its parts are unchanged for longer than a day',
      folder: 1,
      isKept: false,
      parts: 1,
    },
    {
      condition: 'its folder and its parts are unchanged for a day exactly',
      folder: 0,
      isKept: true,
      parts: 0,
    },
    {
      condition: 'its parts changed within a day',
      folder: 1,
      isKept: true,
      parts: -1,
    },
  ])(
    'should keep the parts of another session only while it is not $condition',
    ({ folder: folderSeconds, isKept, parts }) => {
      // Arrange
      const sessions = repositoryOf();
      const other = SessionId.create('session-2');

      partsWrittenIn({
        project: 'first',
        session: other,
        sessions,
      });
      changedBefore({
        days: 1,
        path: join(sessionPartsIn('first', other), 'parts'),
        seconds: parts,
      });
      changedBefore({
        days: 1,
        path: sessionPartsIn('first', other),
        seconds: folderSeconds,
      });

      // Act
      sessions.sweepStaleSessions({
        projectFolderPath: AbsolutePath.create(projectFolder('first')),
        session: keptSession,
      });

      // Assert
      expect(existsSync(sessionPartsIn('first', other))).toBe(isKept);
    },
  );

  it('should keep the parts of the session that starts, however old', () => {
    // Arrange
    const sessions = repositoryOf();

    partsWrittenIn({
      project: 'first',
      session: keptSession,
      sessions,
    });
    changedBefore({
      days: 2,
      path: join(sessionPartsIn('first', keptSession), 'parts'),
    });
    changedBefore({
      days: 2,
      path: sessionPartsIn('first', keptSession),
    });

    // Act
    sessions.sweepStaleSessions({
      projectFolderPath: AbsolutePath.create(projectFolder('first')),
      session: keptSession,
    });

    // Assert
    expect(existsSync(sessionPartsIn('first', keptSession))).toBe(true);
  });

  it("should sweep a session's folder that holds no parts by its own age", () => {
    // Arrange
    const sessions = repositoryOf();
    const stale = sessionPartsIn('first', 'session-2');

    staleSessionIn('session-2');

    // Act
    sessions.sweepStaleSessions({
      projectFolderPath: AbsolutePath.create(projectFolder('first')),
      session: keptSession,
    });

    // Assert
    expect(existsSync(stale)).toBe(false);
  });

  it('should look at no more sessions than its limit', () => {
    // Arrange
    const sessions = repositoryOf({
      maxSessions: 2,
    });

    staleSessionIn('session-2');
    staleSessionIn('session-3');
    staleSessionIn('session-4');

    // Act
    sessions.sweepStaleSessions({
      projectFolderPath: AbsolutePath.create(projectFolder('first')),
      session: keptSession,
    });

    // Assert
    expect(namesOf(join(projectFolder('first'), '.droneey', 'constitution-sessions')).length).toBe(
      1,
    );
  });
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

runGateCommandRepositorySuite({
  name: 'createXdgSessionRepository',
  projectOf: () => AbsolutePath.create(join(folder, 'project')),
  repositoryOf: () => repositoryOf(),
});
