import { describe, expect, it } from 'bun:test';

import { AbsolutePath, BlockId } from '#/kernel/value-objects';

import {
  heldSessionsOf,
  keptSession,
  ownChangesIn,
  reviewDebtIn,
} from '../../../../../__tests__/session.fixtures';
import { createFakeSessionRepository } from '../../../../../__tests__/session-command-repository.fake';
import { SessionAgent, SessionMark } from '../../../../../domain/session/entities';
import { AgentId } from '../../../../../domain/session/value-objects';
import type { StopJudgement } from '../../../../../domain/stop-judgement/entities';
import { HandBackStep, StopVerdict } from '../../../../../domain/stop-judgement/entities';
import { TreeFingerprint } from '../../../../../domain/tree-state/value-objects';
import { recordJudgement } from '../record-judgement.use-case';

const treeNow = TreeFingerprint.create('tree-now');
const treeBefore = TreeFingerprint.create('tree-before');

const heldBefore = {
  marks: [
    {
      mark: SessionMark.Reviewed,
      value: treeBefore,
    },
  ],
};

describe('recordJudgement', () => {
  it.each<{
    condition: string;
    judgement: StopJudgement;
    marks: {
      reviewed: string;
      unjudged: string | undefined;
    };
  }>([
    {
      condition: 'the reviewer finished',
      judgement: {
        fingerprint: treeNow,
        verdict: StopVerdict.Reviewed,
      },
      marks: {
        reviewed: treeNow,
        unjudged: undefined,
      },
    },
    {
      condition: 'the gate held the hand-back, whose holds its own streak counts',
      judgement: {
        blocks: [
          BlockId.create('ui'),
        ],
        fingerprint: treeNow,
        missing: [
          HandBackStep.Check,
          HandBackStep.Review,
        ],
        subagentChanges: [],
        verdict: StopVerdict.Blocked,
      },
      marks: {
        reviewed: treeBefore,
        unjudged: undefined,
      },
    },
    {
      condition: 'git failed to report the tree',
      judgement: {
        reason: 'fatal: bad config',
        verdict: StopVerdict.Unjudged,
      },
      marks: {
        reviewed: treeBefore,
        unjudged: 'fatal: bad config',
      },
    },
  ])('should record what the gate judged when $condition', ({ judgement, marks }) => {
    // Arrange
    const store = heldSessionsOf(heldBefore);

    // Act
    recordJudgement({
      agent: SessionAgent.main,
      judgement,
      session: keptSession,
      sessionRepository: createFakeSessionRepository(store),
    });

    // Assert
    expect({
      reviewed: store.get(keptSession)?.marks.get(SessionMark.Reviewed),
      unjudged: store.get(keptSession)?.marks.get(SessionMark.Unjudged),
    }).toStrictEqual(marks);
  });

  it("should forget the session's own changes and the reviews judged once the check and the review cover them, and no review owed since nor any subagent's own changes", () => {
    // Arrange
    const store = heldSessionsOf(heldBefore);
    const sessionRepository = createFakeSessionRepository(store);
    const path = AbsolutePath.create('/work/project/src/a.ts');
    const later = AbsolutePath.create('/work/project/src/b.ts');
    const subagent = AgentId.create('agent-1');

    sessionRepository.addOwnChanges({
      agent: SessionAgent.main,
      paths: [
        path,
      ],
      session: keptSession,
    });
    sessionRepository.addOwnChanges({
      agent: subagent,
      paths: [
        path,
      ],
      session: keptSession,
    });
    sessionRepository.addReviewDebt({
      paths: [
        path,
        later,
      ],
      session: keptSession,
      subagent,
    });

    // Act
    recordJudgement({
      agent: SessionAgent.main,
      judgement: {
        subagentChanges: [
          {
            agent: subagent,
            path,
          },
        ],
        verdict: StopVerdict.Covered,
      },
      session: keptSession,
      sessionRepository,
    });

    // Assert
    expect({
      debt: reviewDebtIn(store, keptSession),
      own: ownChangesIn(store, {
        agent: SessionAgent.main,
        session: keptSession,
      }),
      subagent: ownChangesIn(store, {
        agent: subagent,
        session: keptSession,
      }),
    }).toStrictEqual({
      debt: [
        {
          agent: subagent,
          path: later,
        },
      ],
      own: [],
      subagent: [
        path,
      ],
    });
  });
});
