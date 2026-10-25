import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { Level } from '#/kernel/constants';
import { BlockId, repositoryUnit, UnitPath } from '#/kernel/value-objects';

import { activeBlockOf, keptSession, mustOf } from '../../../__tests__/session.fixtures';
import { runSessionRepositorySuite } from '../../../__tests__/session-repository.suite';
import type { SessionState } from '../../../domain/entities';
import { CheckState, SessionMark } from '../../../domain/entities';
import { AgentId } from '../../../domain/value-objects';
import { createTmpSessionRepository } from '../tmp-session.repository';

type TmpSessions = ReturnType<typeof createTmpSessionRepository>;

const keptAgent = AgentId.create('agent-7');

let folder = '';

const sessionFolder = (): string => join(folder, keptSession);

const namesOf = (path: string): readonly string[] => readdirSync(path).toSorted();

// A state whose second unit makes no block active, so the third's blocks keep its place, 2.
const savedState: SessionState = {
  active: [
    activeBlockOf({
      files: [
        'blocks/core/core.md',
      ],
      governs: [
        '**/*.ts',
        '**/*.md',
      ],
      id: 'core',
    }),
    activeBlockOf({
      files: [],
      governs: [],
      id: 'ui',
      unit: 'web',
    }),
  ],
  check: CheckState.create('bun run check'),
  musts: [
    mustOf({
      block: 'core',
      slug: 'case-named-should-when',
    }),
    mustOf({
      block: 'ui',
      lowerings: [
        {
          level: Level.May,
          unit: 'web',
        },
        {
          level: Level.Should,
          via: 'screen-is-read',
        },
      ],
      slug: 'screen-reads-aloud',
    }),
  ],
  project: '/work',
  units: [
    repositoryUnit,
    UnitPath.create('api'),
    UnitPath.create('web'),
  ],
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

describe('createTmpSessionRepository', () => {
  it.each([
    {
      condition: 'names a check',
      state: savedState,
      text: [
        'project\t/work',
        'must\tcore\tcase-named-should-when',
        'must\tui\tscreen-reads-aloud (MAY in web; SHOULD via screen-is-read)',
        'check\tbun run check',
        'active\t0\t\tcore\t**/*.ts **/*.md\tblocks/core/core.md',
        'active\t2\tweb\tui\t\t',
        '',
      ].join('\n'),
    },
    {
      condition: 'names no check',
      state: {
        ...savedState,
        active: [],
        check: CheckState.create(),
        musts: [],
      },
      text: 'project\t/work\ncheck\t\n',
    },
    {
      condition: 'comes from a constitution.yaml that did not parse',
      state: {
        ...savedState,
        active: [],
        check: CheckState.unparsed(),
        musts: [],
      },
      text: 'project\t/work\n',
    },
  ])(
    'should write one record to a line, whole, when a state that $condition is saved',
    ({ state, text }) => {
      // Arrange
      const sessions = createTmpSessionRepository({
        folder,
      });

      // Act
      sessions.saveState({
        isReminderKept: false,
        session: keptSession,
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

  it('should read back the state it saved, with the units its active blocks name, when the session asks for it', () => {
    // Arrange
    const sessions = createTmpSessionRepository({
      folder,
    });

    sessions.saveState({
      isReminderKept: false,
      session: keptSession,
      state: savedState,
    });

    // Act
    const state = sessions.state(keptSession);

    // Assert
    expect(state).toStrictEqual({
      ...savedState,
      units: [
        repositoryUnit,
        UnitPath.create('web'),
      ],
    });
  });

  it.each([
    {
      condition: 'its fields are left out, so its blocks and its rules name none',
      expected: {
        active: [],
        check: CheckState.create(),
        musts: [],
        project: '/work',
        units: [],
      },
      text: 'project\t/work\nmust\ncheck\nactive\n',
    },
    {
      condition: 'an active block leaves out what it governs and its files',
      expected: {
        active: [
          activeBlockOf({
            files: [],
            governs: [],
            id: 'core',
          }),
        ],
        check: CheckState.create(),
        musts: [],
        project: '/work',
        units: [
          repositoryUnit,
        ],
      },
      text: 'project\t/work\ncheck\nactive\t0\t\tcore\n',
    },
    {
      condition: 'records repeat, words are split by several spaces and a record is unknown',
      expected: {
        active: [
          activeBlockOf({
            files: [
              'a.md',
              'b.md',
            ],
            governs: [
              '**/ui/**',
              '**/web/**',
            ],
            id: 'ui',
            unit: 'web',
          }),
        ],
        check: CheckState.create('first'),
        musts: [
          mustOf({
            block: 'core',
            slug: 'one',
          }),
        ],
        project: '/first',
        units: [
          UnitPath.create('web'),
        ],
      },
      text: 'project\t/first\nproject\t/second\nnote\tx\ncheck\tfirst\ncheck\tsecond\nmust\tcore\tone\nactive\t2\tweb\tui\t **/ui/**  **/web/** \ta.md  b.md\n',
    },
    {
      condition:
        'its records name what the program never writes, and its active blocks come out of place order',
      expected: {
        active: [
          activeBlockOf({
            files: [
              'ui.md',
            ],
            governs: [
              '**',
            ],
            id: 'ui',
            unit: 'web',
          }),
          activeBlockOf({
            files: [
              'core.md',
            ],
            governs: [
              '**',
            ],
            id: 'core',
          }),
          activeBlockOf({
            files: [
              'api.md',
            ],
            governs: [
              '**',
            ],
            id: 'api',
            unit: 'api',
          }),
        ],
        check: CheckState.unparsed(),
        musts: [
          mustOf({
            block: 'core',
            lowerings: [
              {
                level: Level.Should,
                unit: 'web',
                via: 'rule-c',
              },
            ],
            slug: 'slug-b',
          }),
        ],
        project: '/work',
        units: [
          repositoryUnit,
          UnitPath.create('api'),
          UnitPath.create('web'),
        ],
      },
      text: [
        'project\t/work',
        'active\t2\tweb\tui\t**\tui.md',
        'active\t0\t\tcore\t**\tcore.md',
        'active\t1\tapi\tapi\t**\tapi.md',
        'active\t3\tdocs',
        'active\t3\t../up\tui',
        'other\t3\tdocs\tui\t**\tui.md',
        'must\tcore',
        'must\tcore\tBad_Slug',
        'must\tBad_Block\tslug-a',
        'must\tcore\t slug-a',
        'must\tcore\tslug-a (MAY) x',
        'must\tcore\tslug-b (x MAY; SHOULD in ../up; MAY via Bad_Rule; MUST; MAY via rule-c extra; SHOULD in web via rule-c)',
        '',
      ].join('\n'),
    },
  ])(
    'should read a record as its fields, a missing one as empty, when $condition',
    ({ expected, text }) => {
      // Arrange
      mkdirSync(sessionFolder());
      writeFileSync(join(sessionFolder(), 'active.tsv'), text);

      const sessions = createTmpSessionRepository({
        folder,
      });

      // Act
      const state = sessions.state(keptSession);

      // Assert
      expect(state).toStrictEqual(expected);
    },
  );

  it.each([
    {
      condition: 'it holds no record',
      text: '',
    },
    {
      condition: 'it holds no project record',
      text: 'check\tbun run check\nactive\t0\t\tcore\t**\tcore.md\n',
    },
    {
      condition: 'its project record leaves the project out',
      text: 'project\ncheck\tbun run check\n',
    },
    {
      condition: 'its project record names an empty project',
      text: 'project\t\ncheck\tbun run check\n',
    },
  ])('should give no state when the saved file names no project because $condition', ({ text }) => {
    // Arrange
    mkdirSync(sessionFolder());
    writeFileSync(join(sessionFolder(), 'active.tsv'), text);

    const sessions = createTmpSessionRepository({
      folder,
    });

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
      const sessions = createTmpSessionRepository({
        folder,
      });

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
    mkdirSync(sessionFolder());
    writeFileSync(join(sessionFolder(), 'reminded'), '\n\n');

    const sessions = createTmpSessionRepository({
      folder,
    });

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
    const sessions = createTmpSessionRepository({
      folder,
    });

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
    sessions.recordMark({
      mark: SessionMark.Turn,
      session: keptSession,
      value: 'abc',
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
    const sessions = createTmpSessionRepository({
      folder,
    });

    sessions.saveState({
      isReminderKept: false,
      session: keptSession,
      state: savedState,
    });

    // Act
    sessions.recordMark({
      mark: SessionMark.Checked,
      session: keptSession,
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

    const sessions = createTmpSessionRepository({
      folder,
    });

    // Act
    const mark = sessions.mark({
      mark: SessionMark.Blocked,
      session: keptSession,
    });

    // Assert
    expect(mark).toBe(expected);
  });

  it.each([
    {
      condition: 'a state is saved',
      write: (sessions: TmpSessions): void => {
        sessions.saveState({
          isReminderKept: false,
          session: keptSession,
          state: savedState,
        });
      },
    },
    {
      condition: 'a mark is recorded',
      write: (sessions: TmpSessions): void => {
        sessions.recordMark({
          mark: SessionMark.Turn,
          session: keptSession,
          value: 'abc',
        });
      },
    },
    {
      condition: 'blocks are reminded',
      write: (sessions: TmpSessions): void => {
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
    'should drop the write and leave nothing when $condition but the folder of the sessions is a file',
    ({ write }) => {
      // Arrange
      writeFileSync(join(folder, 'sessions'), '');

      const sessions = createTmpSessionRepository({
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

runSessionRepositorySuite({
  name: 'createTmpSessionRepository',
  repositoryOf: () =>
    createTmpSessionRepository({
      folder,
    }),
});
