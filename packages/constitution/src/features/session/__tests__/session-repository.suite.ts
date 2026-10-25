import { describe, expect, it } from 'bun:test';

import { Level } from '#/kernel/constants';
import { BlockId, repositoryUnit, UnitPath } from '#/kernel/value-objects';

import type { SessionCommandRepository } from '../domain/contracts/repositories/commands';
import type { SessionQueryRepository } from '../domain/contracts/repositories/queries';
import { CheckState, SessionMark } from '../domain/entities';
import { AgentId, SessionId } from '../domain/value-objects';
import { activeBlockOf, mustOf, sessionStateOf } from './session.fixtures';

type SessionRepository = SessionCommandRepository & SessionQueryRepository;

interface SessionRepositorySuiteInput {
  readonly name: string;
  /** a store that never held the session the suite writes to */
  readonly repositoryOf: () => SessionRepository;
}

const session = SessionId.create('session-3');
const agent = AgentId.create('agent-7');
const otherAgent = AgentId.create('agent-8');

// A state of every kind of record, its units the ones its active blocks name.
const savedState = sessionStateOf({
  active: [
    activeBlockOf({
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
    UnitPath.create('web'),
  ],
});

const laterState = sessionStateOf({
  active: [
    activeBlockOf({
      id: 'core',
    }),
  ],
  check: CheckState.unparsed(),
  project: '/work/later',
});

const runSessionRepositorySuite = (input: SessionRepositorySuiteInput): void => {
  describe(`${input.name}: the session repository contracts`, () => {
    it('should read back the state it saved', () => {
      // Arrange
      const sessions = input.repositoryOf();

      sessions.saveState({
        isReminderKept: false,
        session,
        state: savedState,
      });

      // Act
      const state = sessions.state(session);

      // Assert
      expect(state).toStrictEqual(savedState);
    });

    it('should read no state, no mark and no block reminded when the session was never saved', () => {
      // Arrange
      const sessions = input.repositoryOf();

      // Act
      const seen = {
        mark: sessions.mark({
          mark: SessionMark.Turn,
          session,
        }),
        reminded: sessions.reminded({
          agent: undefined,
          session,
        }),
        state: sessions.state(session),
      };

      // Assert
      expect(seen).toStrictEqual({
        mark: undefined,
        reminded: new Set(),
        state: undefined,
      });
    });

    it.each([
      {
        condition: 'a mark is recorded',
        write: (sessions: SessionRepository): void => {
          sessions.recordMark({
            mark: SessionMark.Turn,
            session,
            value: 'abc',
          });
        },
      },
      {
        condition: 'blocks are reminded',
        write: (sessions: SessionRepository): void => {
          sessions.addReminded({
            agent: undefined,
            ids: [
              BlockId.create('ui'),
            ],
            session,
          });
        },
      },
    ])('should drop the write when $condition to a session never saved', ({ write }) => {
      // Arrange
      const sessions = input.repositoryOf();

      // Act
      write(sessions);

      // Assert
      expect({
        mark: sessions.mark({
          mark: SessionMark.Turn,
          session,
        }),
        reminded: sessions.reminded({
          agent: undefined,
          session,
        }),
      }).toStrictEqual({
        mark: undefined,
        reminded: new Set(),
      });
    });

    it('should read the last value recorded of each mark', () => {
      // Arrange
      const sessions = input.repositoryOf();

      sessions.saveState({
        isReminderKept: false,
        session,
        state: savedState,
      });
      sessions.recordMark({
        mark: SessionMark.Turn,
        session,
        value: 'abc',
      });
      sessions.recordMark({
        mark: SessionMark.Turn,
        session,
        value: 'def',
      });
      sessions.recordMark({
        mark: SessionMark.Checked,
        session,
        value: 'f00d',
      });

      // Act
      const seen = {
        blocked: sessions.mark({
          mark: SessionMark.Blocked,
          session,
        }),
        checked: sessions.mark({
          mark: SessionMark.Checked,
          session,
        }),
        turn: sessions.mark({
          mark: SessionMark.Turn,
          session,
        }),
      };

      // Assert
      expect(seen).toStrictEqual({
        blocked: undefined,
        checked: 'f00d',
        turn: 'def',
      });
    });

    it('should read every block reminded so far, to the session and to each agent apart', () => {
      // Arrange
      const sessions = input.repositoryOf();

      sessions.saveState({
        isReminderKept: false,
        session,
        state: savedState,
      });
      sessions.addReminded({
        agent: undefined,
        ids: [
          BlockId.create('core'),
          BlockId.create('ui'),
        ],
        session,
      });
      sessions.addReminded({
        agent: undefined,
        ids: [
          BlockId.create('api'),
        ],
        session,
      });
      sessions.addReminded({
        agent,
        ids: [
          BlockId.create('web'),
        ],
        session,
      });

      // Act
      const seen = {
        agent: sessions.reminded({
          agent,
          session,
        }),
        otherAgent: sessions.reminded({
          agent: otherAgent,
          session,
        }),
        own: sessions.reminded({
          agent: undefined,
          session,
        }),
      };

      // Assert
      expect(seen).toStrictEqual({
        agent: new Set([
          BlockId.create('web'),
        ]),
        otherAgent: new Set(),
        own: new Set([
          BlockId.create('core'),
          BlockId.create('ui'),
          BlockId.create('api'),
        ]),
      });
    });

    it.each([
      {
        condition: 'the save keeps what was reminded',
        isReminderKept: true,
        reminded: {
          agent: new Set([
            BlockId.create('web'),
          ]),
          own: new Set([
            BlockId.create('ui'),
          ]),
        },
      },
      {
        condition: 'the save starts the reminders anew',
        isReminderKept: false,
        reminded: {
          agent: new Set<BlockId>(),
          own: new Set<BlockId>(),
        },
      },
    ])(
      'should replace the state and keep the marks when a session saved before is saved again and $condition',
      ({ isReminderKept, reminded }) => {
        // Arrange
        const sessions = input.repositoryOf();

        sessions.saveState({
          isReminderKept: false,
          session,
          state: savedState,
        });
        sessions.addReminded({
          agent: undefined,
          ids: [
            BlockId.create('ui'),
          ],
          session,
        });
        sessions.addReminded({
          agent,
          ids: [
            BlockId.create('web'),
          ],
          session,
        });
        sessions.recordMark({
          mark: SessionMark.Turn,
          session,
          value: 'abc',
        });

        // Act
        sessions.saveState({
          isReminderKept,
          session,
          state: laterState,
        });

        // Assert
        expect({
          agent: sessions.reminded({
            agent,
            session,
          }),
          own: sessions.reminded({
            agent: undefined,
            session,
          }),
          state: sessions.state(session),
          turn: sessions.mark({
            mark: SessionMark.Turn,
            session,
          }),
        }).toStrictEqual({
          ...reminded,
          state: laterState,
          turn: 'abc',
        });
      },
    );
  });
};

export { runSessionRepositorySuite };
