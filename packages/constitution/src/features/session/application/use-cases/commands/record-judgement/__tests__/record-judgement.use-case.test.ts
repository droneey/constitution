import { describe, expect, it } from 'bun:test';

import { BlockId } from '#/kernel/value-objects';

import { heldSessionsOf, keptSession } from '../../../../../__tests__/session.fixtures';
import { createFakeSessionCommandRepository } from '../../../../../__tests__/session-command-repository.fake';
import type { StopJudgement } from '../../../../../domain/entities';
import { SessionMark, StopVerdict } from '../../../../../domain/entities';
import { TreeFingerprint } from '../../../../../domain/value-objects';
import { recordJudgement } from '../record-judgement.use-case';

const treeNow = TreeFingerprint.create('tree-now');
const treeBefore = TreeFingerprint.create('tree-before');

const heldBefore = {
  marks: [
    {
      mark: SessionMark.Reviewed,
      value: treeBefore,
    },
    {
      mark: SessionMark.Blocked,
      value: treeBefore,
    },
  ],
};

describe('recordJudgement', () => {
  it.each<{
    condition: string;
    judgement: StopJudgement;
    marks: {
      blocked: string;
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
        blocked: treeBefore,
        reviewed: treeNow,
        unjudged: undefined,
      },
    },
    {
      condition: 'the gate blocked the hand-back',
      judgement: {
        fingerprint: treeNow,
        verdict: StopVerdict.Blocked,
      },
      marks: {
        blocked: treeNow,
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
        blocked: treeBefore,
        reviewed: treeBefore,
        unjudged: 'fatal: bad config',
      },
    },
  ])('should record what the gate judged when $condition', ({ judgement, marks }) => {
    // Arrange
    const store = heldSessionsOf(heldBefore);

    // Act
    recordJudgement({
      judgement,
      session: keptSession,
      sessions: createFakeSessionCommandRepository(store),
    });

    // Assert
    expect({
      blocked: store.get(keptSession)?.marks.get(SessionMark.Blocked),
      reviewed: store.get(keptSession)?.marks.get(SessionMark.Reviewed),
      unjudged: store.get(keptSession)?.marks.get(SessionMark.Unjudged),
    }).toStrictEqual(marks);
  });

  it('should record nothing when the gate asked for a review', () => {
    // Arrange
    const store = heldSessionsOf(heldBefore);

    // Act
    recordJudgement({
      judgement: {
        blocks: [
          BlockId.create('ui'),
        ],
        verdict: StopVerdict.Review,
      },
      session: keptSession,
      sessions: createFakeSessionCommandRepository(store),
    });

    // Assert
    expect(Object.fromEntries(store.get(keptSession)?.marks ?? [])).toStrictEqual({
      [SessionMark.Reviewed]: treeBefore,
      [SessionMark.Blocked]: treeBefore,
    });
  });
});
