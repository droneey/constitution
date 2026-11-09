import { describe, expect, it } from 'bun:test';

import { Level } from '#/kernel/constants';
import { ConfigReadStatus } from '#/kernel/entities';
import { AbsolutePath, BlockId } from '#/kernel/value-objects';

import type { SessionRepository } from '../application/contracts/repositories/commands';
import type { SessionQueries } from '../application/contracts/repositories/queries';
import type { SessionState } from '../domain/session/entities';
import { SessionAgent, SessionMark } from '../domain/session/entities';
import { AgentId, SessionId } from '../domain/session/value-objects';
import type { ReviewDebt } from '../domain/stop-judgement/entities';
import { TreeFingerprint } from '../domain/tree-state/value-objects';
import { keptBlockOf, mustOf, sessionStateOf } from './session.fixtures';

type SessionPort = SessionRepository & SessionQueries;

interface SessionRepositorySuiteInput {
  readonly name: string;
  readonly repositoryOf: () => SessionPort;
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
      const sessionPort = input.repositoryOf();

      sessionPort.saveState({
        isReminderKept: false,
        session,
        state: savedState,
      });

      // Act
      const state = sessionPort.state(session);

      // Assert
      expect(state).toStrictEqual(savedState);
    });

    it('should read no state, no mark and no block reminded when the session was never saved', () => {
      // Arrange
      const sessionPort = input.repositoryOf();

      // Act
      const seen = {
        mark: sessionPort.fingerprint({
          mark: SessionMark.Turn,
          session,
        }),
        reminded: sessionPort.reminded({
          agent: SessionAgent.main,
          session,
        }),
        state: sessionPort.state(session),
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
        write: (sessionPort: SessionPort): void => {
          sessionPort.recordFingerprint({
            fingerprint: TreeFingerprint.create('abc'),
            mark: SessionMark.Turn,
            session,
          });
        },
      },
      {
        condition: 'blocks are reminded',
        write: (sessionPort: SessionPort): void => {
          sessionPort.addReminded({
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
      const sessionPort = input.repositoryOf();

      // Act
      write(sessionPort);

      // Assert
      expect({
        mark: sessionPort.fingerprint({
          mark: SessionMark.Turn,
          session,
        }),
        reminded: sessionPort.reminded({
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
      const sessionPort = input.repositoryOf();

      sessionPort.saveState({
        isReminderKept: false,
        session,
        state: savedState,
      });
      sessionPort.recordFingerprint({
        fingerprint: TreeFingerprint.create('abc'),
        mark: SessionMark.Turn,
        session,
      });
      sessionPort.recordFingerprint({
        fingerprint: TreeFingerprint.create('def'),
        mark: SessionMark.Turn,
        session,
      });
      sessionPort.recordFingerprint({
        fingerprint: TreeFingerprint.create('f00d'),
        mark: SessionMark.Checked,
        session,
      });
      sessionPort.recordUnjudged({
        reason: 'git timed out',
        session,
      });

      // Act
      const seen = {
        reviewed: sessionPort.fingerprint({
          mark: SessionMark.Reviewed,
          session,
        }),
        checked: sessionPort.fingerprint({
          mark: SessionMark.Checked,
          session,
        }),
        turn: sessionPort.fingerprint({
          mark: SessionMark.Turn,
          session,
        }),
        unjudged: sessionPort.unjudged(session),
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
      const sessionPort = input.repositoryOf();

      sessionPort.saveState({
        isReminderKept: false,
        session,
        state: savedState,
      });
      sessionPort.addReminded({
        agent: SessionAgent.main,
        ids: [
          BlockId.create('core'),
          BlockId.create('ui'),
        ],
        session,
      });
      sessionPort.addReminded({
        agent: SessionAgent.main,
        ids: [
          BlockId.create('api'),
        ],
        session,
      });
      sessionPort.addReminded({
        agent,
        ids: [
          BlockId.create('web'),
        ],
        session,
      });

      // Act
      const seen = {
        agent: sessionPort.reminded({
          agent,
          session,
        }),
        otherAgent: sessionPort.reminded({
          agent: otherAgent,
          session,
        }),
        own: sessionPort.reminded({
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
        const sessionPort = input.repositoryOf();

        sessionPort.saveState({
          isReminderKept: false,
          session,
          state: savedState,
        });
        sessionPort.addReminded({
          agent: SessionAgent.main,
          ids: [
            BlockId.create('ui'),
          ],
          session,
        });
        sessionPort.addReminded({
          agent,
          ids: [
            BlockId.create('web'),
          ],
          session,
        });
        sessionPort.recordFingerprint({
          fingerprint: TreeFingerprint.create('abc'),
          mark: SessionMark.Turn,
          session,
        });

        // Act
        sessionPort.saveState({
          isReminderKept,
          session,
          state: laterState,
        });

        // Assert
        expect({
          agent: sessionPort.reminded({
            agent,
            session,
          }),
          own: sessionPort.reminded({
            agent: SessionAgent.main,
            session,
          }),
          state: sessionPort.state(session),
          turn: sessionPort.fingerprint({
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
      clear: (sessionPort: SessionPort) => void;
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
        clear: (sessionPort) => {
          sessionPort.clearOwnChanges({
            agent: SessionAgent.main,
            session,
          });
        },
        condition: 'a check and a review cleared them',
        expected: [],
      },
      {
        asked: agent,
        clear: (sessionPort) => {
          sessionPort.clearOwnChanges({
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
      const sessionPort = input.repositoryOf();

      sessionPort.addOwnChanges({
        agent: SessionAgent.main,
        paths: [
          firstPath,
          secondPath,
          firstPath,
        ],
        session,
      });
      sessionPort.addOwnChanges({
        agent,
        paths: [
          secondPath,
        ],
        session,
      });

      clear(sessionPort);

      // Act
      const own = sessionPort.ownChanges({
        agent: asked,
        session,
      });

      // Assert
      expect(own).toStrictEqual(expected);
    });

    it.each<{
      condition: string;
      expected: readonly ReviewDebt[];
      write: (sessionPort: SessionPort) => void;
    }>([
      {
        condition: 'they are owed, once each',
        expected: [
          firstReview,
          secondReview,
        ],
        write: (sessionPort) => {
          sessionPort.addReviewDebt(reviewOwed);
          sessionPort.addReviewDebt(reviewOwed);
        },
      },
      {
        condition: 'the reviews judged are settled',
        expected: [],
        write: (sessionPort) => {
          sessionPort.addReviewDebt(reviewOwed);
          sessionPort.settleReviewDebt({
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
        write: (sessionPort) => {
          sessionPort.addReviewDebt({
            ...reviewOwed,
            paths: [
              firstPath,
            ],
          });
          sessionPort.addReviewDebt({
            ...reviewOwed,
            paths: [
              secondPath,
            ],
          });
          sessionPort.settleReviewDebt({
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
        write: (sessionPort) => {
          const firstOwed = {
            ...reviewOwed,
            paths: [
              firstPath,
            ],
          };

          sessionPort.addReviewDebt(firstOwed);
          sessionPort.settleReviewDebt({
            debts: [
              firstReview,
            ],
            session,
          });
          sessionPort.addReviewDebt(firstOwed);
        },
      },
    ])('should read back the reviews owed for subagents when $condition', ({ expected, write }) => {
      // Arrange
      const sessionPort = input.repositoryOf();

      write(sessionPort);

      // Act
      const owed = sessionPort.reviewDebt(session);

      // Assert
      expect(owed).toStrictEqual(expected);
    });
  });
};

export { runSessionRepositorySuite };
