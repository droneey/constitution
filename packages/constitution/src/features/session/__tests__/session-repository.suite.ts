import { describe, expect, it } from 'bun:test';

import { Level } from '#/kernel/constants';
import { ConfigReadStatus } from '#/kernel/entities';
import { AbsolutePath, BlockId } from '#/kernel/value-objects';

import type { SessionCommandRepository } from '../domain/contracts/repositories/commands';
import type { SessionQueryRepository } from '../domain/contracts/repositories/queries';
import type { ReviewDebt, SessionState } from '../domain/entities';
import { SessionAgent, SessionMark } from '../domain/entities';
import { AgentId, SessionId, TreeFingerprint } from '../domain/value-objects';
import { keptBlockOf, mustOf, sessionStateOf } from './session.fixtures';

type SessionRepository = SessionCommandRepository & SessionQueryRepository;

interface SessionRepositorySuiteInput {
  readonly name: string;
  readonly repositoryOf: () => SessionRepository;
}

const session = SessionId.create('session-3');
const agent = AgentId.create('agent-7');
const otherAgent = AgentId.create('agent-8');

const savedState = sessionStateOf({
  active: [
    keptBlockOf({
      id: 'core',
    }),
    keptBlockOf({
      files: [],
      governs: [],
      id: 'ui',
      unit: 'web',
    }),
  ],
  mustsBesideCore: [
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
  repositoryFolderPath: AbsolutePath.create('/work'),
});

const firstPath = AbsolutePath.create('/work/src/a.ts');
const secondPath = AbsolutePath.create('/work/src/b.ts');
const firstReview: ReviewDebt = {
  agent,
  path: firstPath,
};
const secondReview: ReviewDebt = {
  agent,
  path: secondPath,
};
const reviewOwed = {
  paths: [
    firstPath,
    secondPath,
  ],
  session,
  subagent: agent,
};

const laterState: SessionState = {
  repositoryFolderPath: AbsolutePath.create('/work/later'),
  status: ConfigReadStatus.Unparsed,
};

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
        mark: sessions.fingerprint({
          mark: SessionMark.Turn,
          session,
        }),
        reminded: sessions.reminded({
          agent: SessionAgent.main,
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
          sessions.recordFingerprint({
            fingerprint: TreeFingerprint.create('abc'),
            mark: SessionMark.Turn,
            session,
          });
        },
      },
      {
        condition: 'blocks are reminded',
        write: (sessions: SessionRepository): void => {
          sessions.addReminded({
            agent: SessionAgent.main,
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
        mark: sessions.fingerprint({
          mark: SessionMark.Turn,
          session,
        }),
        reminded: sessions.reminded({
          agent: SessionAgent.main,
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
      sessions.recordFingerprint({
        fingerprint: TreeFingerprint.create('abc'),
        mark: SessionMark.Turn,
        session,
      });
      sessions.recordFingerprint({
        fingerprint: TreeFingerprint.create('def'),
        mark: SessionMark.Turn,
        session,
      });
      sessions.recordFingerprint({
        fingerprint: TreeFingerprint.create('f00d'),
        mark: SessionMark.Checked,
        session,
      });
      sessions.recordUnjudged({
        reason: 'git timed out',
        session,
      });

      // Act
      const seen = {
        reviewed: sessions.fingerprint({
          mark: SessionMark.Reviewed,
          session,
        }),
        checked: sessions.fingerprint({
          mark: SessionMark.Checked,
          session,
        }),
        turn: sessions.fingerprint({
          mark: SessionMark.Turn,
          session,
        }),
        unjudged: sessions.unjudged(session),
      };

      // Assert
      expect(seen).toStrictEqual({
        checked: TreeFingerprint.create('f00d'),
        reviewed: undefined,
        turn: TreeFingerprint.create('def'),
        unjudged: 'git timed out',
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
        agent: SessionAgent.main,
        ids: [
          BlockId.create('core'),
          BlockId.create('ui'),
        ],
        session,
      });
      sessions.addReminded({
        agent: SessionAgent.main,
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
          agent: SessionAgent.main,
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
          agent: SessionAgent.main,
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
        sessions.recordFingerprint({
          fingerprint: TreeFingerprint.create('abc'),
          mark: SessionMark.Turn,
          session,
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
            agent: SessionAgent.main,
            session,
          }),
          state: sessions.state(session),
          turn: sessions.fingerprint({
            mark: SessionMark.Turn,
            session,
          }),
        }).toStrictEqual({
          ...reminded,
          state: laterState,
          turn: TreeFingerprint.create('abc'),
        });
      },
    );

    it.each<{
      asked: SessionAgent;
      clear: (sessions: SessionRepository) => void;
      condition: string;
      expected: readonly AbsolutePath[];
    }>([
      {
        asked: SessionAgent.main,
        clear: () => undefined,
        condition: 'it changed them, once each',
        expected: [
          firstPath,
          secondPath,
        ],
      },
      {
        asked: SessionAgent.main,
        clear: (sessions) => {
          sessions.clearOwnChanges({
            agent: SessionAgent.main,
            session,
          });
        },
        condition: 'a check and a review cleared them',
        expected: [],
      },
      {
        asked: agent,
        clear: (sessions) => {
          sessions.clearOwnChanges({
            agent: SessionAgent.main,
            session,
          });
        },
        condition: 'another agent changed one of them',
        expected: [
          secondPath,
        ],
      },
    ])("should read back an agent's own changes when $condition", ({ asked, clear, expected }) => {
      // Arrange
      const sessions = input.repositoryOf();

      sessions.addOwnChanges({
        agent: SessionAgent.main,
        paths: [
          firstPath,
          secondPath,
          firstPath,
        ],
        session,
      });
      sessions.addOwnChanges({
        agent,
        paths: [
          secondPath,
        ],
        session,
      });

      clear(sessions);

      // Act
      const own = sessions.ownChanges({
        agent: asked,
        session,
      });

      // Assert
      expect(own).toStrictEqual(expected);
    });

    it.each<{
      condition: string;
      expected: readonly ReviewDebt[];
      write: (sessions: SessionRepository) => void;
    }>([
      {
        condition: 'they are owed, once each',
        expected: [
          firstReview,
          secondReview,
        ],
        write: (sessions) => {
          sessions.addReviewDebt(reviewOwed);
          sessions.addReviewDebt(reviewOwed);
        },
      },
      {
        condition: 'the reviews judged are settled',
        expected: [],
        write: (sessions) => {
          sessions.addReviewDebt(reviewOwed);
          sessions.settleReviewDebt({
            debts: [
              firstReview,
              secondReview,
            ],
            session,
          });
        },
      },
      {
        condition: 'a review was owed after the judged ones were read and before they were settled',
        expected: [
          secondReview,
        ],
        write: (sessions) => {
          sessions.addReviewDebt({
            ...reviewOwed,
            paths: [
              firstPath,
            ],
          });
          sessions.addReviewDebt({
            ...reviewOwed,
            paths: [
              secondPath,
            ],
          });
          sessions.settleReviewDebt({
            debts: [
              firstReview,
            ],
            session,
          });
        },
      },
      {
        condition: 'a review is owed again after it was settled',
        expected: [
          firstReview,
        ],
        write: (sessions) => {
          const firstOwed = {
            ...reviewOwed,
            paths: [
              firstPath,
            ],
          };

          sessions.addReviewDebt(firstOwed);
          sessions.settleReviewDebt({
            debts: [
              firstReview,
            ],
            session,
          });
          sessions.addReviewDebt(firstOwed);
        },
      },
    ])('should read back the reviews owed for subagents when $condition', ({ expected, write }) => {
      // Arrange
      const sessions = input.repositoryOf();

      write(sessions);

      // Act
      const owed = sessions.reviewDebt(session);

      // Assert
      expect(owed).toStrictEqual(expected);
    });
  });
};

export { runSessionRepositorySuite };
